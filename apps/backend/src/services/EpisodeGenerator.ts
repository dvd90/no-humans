import { DataSource } from 'typeorm';
import { Agent } from '../entities/Agent';
import { AgentMemory } from '../entities/AgentMemory';
import { Episode } from '../entities/Episode';
import { Prediction } from '../entities/Prediction';
import { Relationship } from '../entities/Relationship';
import { Season } from '../entities/Season';
import { SimulationRun } from '../entities/SimulationRun';
import { Vote } from '../entities/Vote';
import { WorldEvent } from '../entities/WorldEvent';
import { WorldState } from '../entities/WorldState';
import { LLMService } from './LLMService';
import { SimulationService, VoteEffect } from './SimulationService';

const VOTE_EFFECTS: Record<string, VoteEffect['stateDeltas']> = {
  'Heavy storm': { shelterQuality: -15, morale: -10 },
  'Food shortage': { food: -20, conflictLevel: 10 },
  'Discovery of a hidden cave': { shelterQuality: 10, morale: 8 },
  'A mysterious message appears': { conflictLevel: 8, morale: -3 },
};

/**
 * Runs a full simulation against the live database and persists the
 * resulting episode as a draft for admin review.
 */
export class EpisodeGenerator {
  constructor(
    private dataSource: DataSource,
    private llm: LLMService,
  ) {}

  async generateNextEpisode(worldId: string): Promise<Episode> {
    const runRepo = this.dataSource.getRepository(SimulationRun);
    const run = await runRepo.save(runRepo.create({ worldId, status: 'running' }));

    try {
      const episode = await this.execute(worldId, run);
      run.status = 'completed';
      run.episodeId = episode.id;
      run.completedAt = new Date();
      await runRepo.save(run);
      return episode;
    } catch (err) {
      run.status = 'failed';
      run.errorMessage = err instanceof Error ? err.message : String(err);
      run.completedAt = new Date();
      await runRepo.save(run);
      throw err;
    }
  }

  private async execute(worldId: string, run: SimulationRun): Promise<Episode> {
    const season = await this.dataSource.getRepository(Season).findOne({
      where: { worldId, status: 'active' },
    });
    if (!season) throw new Error('No active season for this world');

    const lastEpisode = await this.dataSource.getRepository(Episode).findOne({
      where: { worldId },
      order: { number: 'DESC' },
    });

    const simulation = new SimulationService({
      llm: this.llm,
      loadWorldState: async (wid) => {
        const state = await this.dataSource.getRepository(WorldState).findOne({
          where: { worldId: wid },
          order: { day: 'DESC' },
        });
        if (!state) throw new Error('No world state found — run the seed first');
        return state;
      },
      loadAgents: (wid) =>
        this.dataSource.getRepository(Agent).find({ where: { worldId: wid } }),
      loadRelationships: (wid) =>
        this.dataSource.getRepository(Relationship).find({ where: { worldId: wid } }),
      loadRecentMemories: (agentId) =>
        this.dataSource.getRepository(AgentMemory).find({
          where: { agentId },
          order: { importance: 'DESC', createdAt: 'DESC' },
          take: 5,
        }),
      getWinningVoteEffect: async (wid) => {
        const vote = await this.dataSource
          .getRepository(Vote)
          .createQueryBuilder('vote')
          .where('vote.worldId = :wid', { wid })
          .andWhere('vote.winnerId IS NULL')
          .orderBy('vote.createdAt', 'DESC')
          .getOne();
        if (!vote) return null;

        const counts = { A: vote.votesA, B: vote.votesB, C: vote.votesC, D: vote.votesD };
        const winner = (Object.keys(counts) as Array<keyof typeof counts>).reduce((a, b) =>
          counts[a] >= counts[b] ? a : b,
        );
        vote.winnerId = winner;
        await this.dataSource.getRepository(Vote).save(vote);

        const optionText = vote[`option${winner}` as 'optionA'];
        return {
          description: optionText,
          stateDeltas: VOTE_EFFECTS[optionText] ?? { morale: -2 },
        };
      },
      previousCliffhanger: lastEpisode?.cliffhanger ?? '',
    });

    const result = await simulation.generateEpisode(worldId);

    run.proposedActions = result.proposedActions as unknown[];
    run.resolvedEvents = result.resolvedEvents as unknown[];

    return this.dataSource.transaction(async (manager) => {
      // Persist the new world state snapshot
      const stateRepo = manager.getRepository(WorldState);
      const { id: _oldId, createdAt: _created, ...stateFields } = result.newWorldState;
      const newState = await stateRepo.save(stateRepo.create(stateFields));

      // Persist relationship updates
      await manager.getRepository(Relationship).save(result.updatedRelationships);

      // Create the draft episode
      const episodeRepo = manager.getRepository(Episode);
      const episode = await episodeRepo.save(
        episodeRepo.create({
          worldId,
          seasonId: (await manager.getRepository(Season).findOneOrFail({
            where: { worldId, status: 'active' },
          })).id,
          number: (lastEpisode?.number ?? 0) + 1,
          title: result.narration.title,
          previouslySummary: result.narration.previouslySummary,
          summary: result.narration.summary,
          mainEvents: result.narration.mainEvents,
          cliffhanger: result.narration.cliffhanger,
          status: 'draft',
        }),
      );

      // Persist world events
      const eventRepo = manager.getRepository(WorldEvent);
      await eventRepo.save(
        result.resolvedEvents.map((e) =>
          eventRepo.create({
            worldId,
            episodeId: episode.id,
            day: newState.day,
            type: e.actionType,
            title: `${e.actionType} (${e.outcome})`,
            description: e.description,
            involvedAgentIds: [e.agentId, ...(e.targetAgentId ? [e.targetAgentId] : [])],
            stateChanges: e.stateDeltas as Record<string, unknown>,
            importance: e.importance,
          }),
        ),
      );

      // Persist predictions
      const predictionRepo = manager.getRepository(Prediction);
      await predictionRepo.save(
        result.predictions.map((p) =>
          predictionRepo.create({
            episodeId: episode.id,
            question: p.question,
            optionA: p.optionA,
            optionB: p.optionB,
          }),
        ),
      );

      // Store important events as agent memories
      const memoryRepo = manager.getRepository(AgentMemory);
      const importantEvents = result.resolvedEvents.filter((e) => e.importance >= 5);
      await memoryRepo.save(
        importantEvents.flatMap((e) =>
          [e.agentId, ...(e.targetAgentId ? [e.targetAgentId] : [])].map((agentId) =>
            memoryRepo.create({
              agentId,
              episodeId: episode.id,
              type: 'event' as const,
              content: e.description,
              importance: e.importance,
            }),
          ),
        ),
      );

      return episode;
    });
  }
}

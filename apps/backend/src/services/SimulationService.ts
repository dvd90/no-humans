import { Agent } from '../entities/Agent';
import { AgentMemory } from '../entities/AgentMemory';
import { Relationship } from '../entities/Relationship';
import { WorldState } from '../entities/WorldState';
import {
  ActionResolver,
  ProposedAction,
  ResolvedEvent,
} from '../engine/ActionResolver';
import {
  applyStateDeltasToWorldState,
  applyEnvironmentalDecay,
} from '../engine/StateUpdater';
import { applyRelationshipDeltas } from '../engine/RelationshipUpdater';
import { EpisodeNarration, GeneratedPrediction } from './LLMService';

export interface VoteEffect {
  description: string;
  stateDeltas: Partial<{
    food: number;
    water: number;
    shelterQuality: number;
    morale: number;
    conflictLevel: number;
  }>;
}

/** LLM surface the simulation needs — satisfied by LLMService, mockable in tests. */
export interface SimulationLLM {
  generateAgentIntention(
    agent: Agent,
    worldState: WorldState,
    relationships: Relationship[],
    recentMemories: AgentMemory[],
  ): Promise<ProposedAction>;
  generateEpisodeNarration(
    resolvedEventDescriptions: string[],
    worldState: WorldState,
    agentNames: string[],
    previousCliffhanger: string,
  ): Promise<EpisodeNarration>;
  generatePredictions(
    cliffhanger: string,
    agentNames: string[],
    worldState: WorldState,
  ): Promise<GeneratedPrediction[]>;
}

export interface SimulationDeps {
  llm: SimulationLLM;
  loadWorldState(worldId: string): Promise<WorldState>;
  loadAgents(worldId: string): Promise<Agent[]>;
  loadRelationships(worldId: string): Promise<Relationship[]>;
  loadRecentMemories(agentId: string): Promise<AgentMemory[]>;
  getWinningVoteEffect(worldId: string): Promise<VoteEffect | null>;
  previousCliffhanger?: string;
}

export interface SimulationResult {
  proposedActions: ProposedAction[];
  resolvedEvents: ResolvedEvent[];
  newWorldState: WorldState;
  updatedRelationships: Relationship[];
  narration: EpisodeNarration;
  predictions: GeneratedPrediction[];
  appliedVoteEffect: VoteEffect | null;
  failedAgentIds: string[];
}

export class SimulationService {
  private resolver = new ActionResolver();

  constructor(private deps: SimulationDeps) {}

  async generateEpisode(worldId: string): Promise<SimulationResult> {
    const [worldState, agents, relationships] = await Promise.all([
      this.deps.loadWorldState(worldId),
      this.deps.loadAgents(worldId),
      this.deps.loadRelationships(worldId),
    ]);

    // 1. Apply winning community vote as an environmental event
    const voteEffect = await this.deps.getWinningVoteEffect(worldId);
    let state: WorldState = { ...worldState };
    if (voteEffect) {
      state = applyStateDeltasToWorldState(state, [
        {
          agentId: 'environment',
          actionType: 'explore',
          outcome: 'success',
          description: voteEffect.description,
          stateDeltas: voteEffect.stateDeltas,
          relationshipDeltas: [],
          importance: 8,
        },
      ]);
    }

    // 2. Generate intentions for active agents (LLM proposes)
    const activeAgents = agents.filter((a) => a.status === 'active');
    const proposedActions: ProposedAction[] = [];
    const failedAgentIds: string[] = [];

    for (const agent of activeAgents) {
      try {
        const memories = await this.deps.loadRecentMemories(agent.id);
        const action = await this.deps.llm.generateAgentIntention(
          agent,
          state,
          relationships,
          memories,
        );
        proposedActions.push(action);
      } catch {
        failedAgentIds.push(agent.id);
      }
    }

    // 3. Engine validates and resolves (engine is the source of truth)
    const resolvedEvents: ResolvedEvent[] = proposedActions.map((action) => {
      const agent = agents.find((a) => a.id === action.agentId);
      if (!agent) {
        return {
          agentId: action.agentId,
          actionType: action.actionType,
          outcome: 'blocked' as const,
          description: 'Unknown agent',
          stateDeltas: {},
          relationshipDeltas: [],
          importance: 1,
        };
      }
      return this.resolver.resolve(action, agent, agents, state, relationships);
    });

    // 4. Apply state changes + daily decay, advance the day
    let newWorldState = applyStateDeltasToWorldState(state, resolvedEvents);
    newWorldState = applyEnvironmentalDecay(newWorldState);
    newWorldState = { ...newWorldState, day: worldState.day + 1 };

    // 5. Apply relationship deltas
    const updatedRelationships = applyRelationshipDeltas(relationships, resolvedEvents);

    // 6. Narrate + generate predictions
    const agentNames = activeAgents.map((a) => a.name);
    const narration = await this.deps.llm.generateEpisodeNarration(
      resolvedEvents.map((e) => e.description),
      newWorldState,
      agentNames,
      this.deps.previousCliffhanger ?? '',
    );
    const predictions = await this.deps.llm.generatePredictions(
      narration.cliffhanger,
      agentNames,
      newWorldState,
    );

    return {
      proposedActions,
      resolvedEvents,
      newWorldState,
      updatedRelationships,
      narration,
      predictions,
      appliedVoteEffect: voteEffect,
      failedAgentIds,
    };
  }
}

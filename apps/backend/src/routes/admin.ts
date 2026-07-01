import { Router, Request, Response, NextFunction } from 'express';
import { requireAdminSecret } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Episode } from '../entities/Episode';
import { Agent } from '../entities/Agent';
import { World } from '../entities/World';
import { WorldState } from '../entities/WorldState';
import { EpisodeGenerator } from '../services/EpisodeGenerator';
import { LLMService } from '../services/LLMService';

const router = Router();
router.use(requireAdminSecret);

// Run the simulation and create the next draft episode
router.post('/generate-episode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let worldId = req.body?.worldId as string | undefined;
    if (!worldId) {
      const world = await AppDataSource.getRepository(World).findOne({
        where: { isActive: true },
      });
      if (!world) {
        res.status(400).json({ error: 'No active world found — run the seed first' });
        return;
      }
      worldId = world.id;
    }

    const llm = new LLMService(process.env.ANTHROPIC_API_KEY ?? '');
    const generator = new EpisodeGenerator(AppDataSource, llm);
    const episode = await generator.generateNextEpisode(worldId);

    res.status(201).json(episode);
  } catch (err) {
    next(err);
  }
});

// List all episodes including drafts
router.get('/episodes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const episodes = await AppDataSource.getRepository(Episode).find({
      order: { number: 'DESC' },
    });
    res.json(episodes);
  } catch (err) {
    next(err);
  }
});

// Publish a draft episode
router.post('/episodes/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = AppDataSource.getRepository(Episode);
    const episode = await repo.findOne({ where: { id: req.params.id } });

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    if (episode.status === 'published') {
      res.status(400).json({ error: 'Episode already published' });
      return;
    }

    episode.status = 'published';
    episode.publishedAt = new Date();
    await repo.save(episode);

    res.json(episode);
  } catch (err) {
    next(err);
  }
});

// Edit agent
router.patch('/agents/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = AppDataSource.getRepository(Agent);
    const agent = await repo.findOne({ where: { id: req.params.id } });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const allowed = ['personality', 'goal', 'status', 'energy', 'trustScore', 'publicReputation'] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (agent as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }

    await repo.save(agent);
    res.json(agent);
  } catch (err) {
    next(err);
  }
});

// Edit world state
router.patch('/world-states/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = AppDataSource.getRepository(WorldState);
    const state = await repo.findOne({ where: { id: req.params.id } });

    if (!state) {
      res.status(404).json({ error: 'World state not found' });
      return;
    }

    const allowed = ['food', 'water', 'shelterQuality', 'morale', 'conflictLevel', 'leadershipStructure', 'activeCrisis', 'factions'] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (state as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }

    await repo.save(state);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

export default router;

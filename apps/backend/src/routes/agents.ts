import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Agent } from '../entities/Agent';
import { Relationship } from '../entities/Relationship';
import { AgentMemory } from '../entities/AgentMemory';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await AppDataSource.getRepository(Agent).find({
      order: { createdAt: 'ASC' },
    });
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await AppDataSource.getRepository(Agent).findOne({
      where: { id: req.params.id },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const relationships = await AppDataSource.getRepository(Relationship).find({
      where: [{ agentAId: agent.id }, { agentBId: agent.id }],
    });

    const memories = await AppDataSource.getRepository(AgentMemory).find({
      where: { agentId: agent.id },
      order: { importance: 'DESC', createdAt: 'DESC' },
      take: 10,
    });

    res.json({ ...agent, relationships, memories });
  } catch (err) {
    next(err);
  }
});

export default router;

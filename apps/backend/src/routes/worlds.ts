import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { World } from '../entities/World';
import { WorldState } from '../entities/WorldState';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const worlds = await AppDataSource.getRepository(World).find({
      where: { isActive: true },
    });
    res.json(worlds);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const world = await AppDataSource.getRepository(World).findOne({
      where: { id: req.params.id },
    });

    if (!world) {
      res.status(404).json({ error: 'World not found' });
      return;
    }

    const latestState = await AppDataSource.getRepository(WorldState).findOne({
      where: { worldId: world.id },
      order: { day: 'DESC' },
    });

    res.json({ ...world, currentState: latestState });
  } catch (err) {
    next(err);
  }
});

export default router;

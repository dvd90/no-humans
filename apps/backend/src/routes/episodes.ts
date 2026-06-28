import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Episode } from '../entities/Episode';
import { WorldEvent } from '../entities/WorldEvent';
import { Prediction } from '../entities/Prediction';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const episodes = await AppDataSource.getRepository(Episode).find({
      where: { status: 'published' },
      order: { number: 'DESC' },
      take: 20,
    });
    res.json(episodes);
  } catch (err) {
    next(err);
  }
});

router.get('/latest', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const episode = await AppDataSource.getRepository(Episode).findOne({
      where: { status: 'published' },
      order: { number: 'DESC' },
    });

    if (!episode) {
      res.status(404).json({ error: 'No published episodes yet' });
      return;
    }

    res.json(episode);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const episode = await AppDataSource.getRepository(Episode).findOne({
      where: { id: req.params.id, status: 'published' },
    });

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    const [events, predictions] = await Promise.all([
      AppDataSource.getRepository(WorldEvent).find({
        where: { episodeId: episode.id },
        order: { importance: 'DESC' },
      }),
      AppDataSource.getRepository(Prediction).find({
        where: { episodeId: episode.id },
      }),
    ]);

    res.json({ ...episode, events, predictions });
  } catch (err) {
    next(err);
  }
});

export default router;

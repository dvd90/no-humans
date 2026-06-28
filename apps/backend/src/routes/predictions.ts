import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Prediction } from '../entities/Prediction';

const router = Router();

router.get('/episode/:episodeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const predictions = await AppDataSource.getRepository(Prediction).find({
      where: { episodeId: req.params.episodeId },
    });
    res.json(predictions);
  } catch (err) {
    next(err);
  }
});

export default router;

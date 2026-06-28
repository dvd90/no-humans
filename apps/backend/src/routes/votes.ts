import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Vote } from '../entities/Vote';

const router = Router();

router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const vote = await AppDataSource.getRepository(Vote)
      .createQueryBuilder('vote')
      .where('vote.winnerId IS NULL')
      .andWhere('vote.closesAt > :now', { now })
      .orderBy('vote.createdAt', 'DESC')
      .getOne();

    if (!vote) {
      res.status(404).json({ error: 'No active vote' });
      return;
    }

    res.json(vote);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { option } = req.body as { option: 'A' | 'B' | 'C' | 'D' };
    if (!['A', 'B', 'C', 'D'].includes(option)) {
      res.status(400).json({ error: 'Invalid option. Must be A, B, C, or D' });
      return;
    }

    const repo = AppDataSource.getRepository(Vote);
    const vote = await repo.findOne({ where: { id: req.params.id } });

    if (!vote) {
      res.status(404).json({ error: 'Vote not found' });
      return;
    }

    if (vote.winnerId || new Date() > vote.closesAt) {
      res.status(400).json({ error: 'Vote is closed' });
      return;
    }

    const field = `votes${option}` as 'votesA' | 'votesB' | 'votesC' | 'votesD';
    vote[field] += 1;
    await repo.save(vote);

    res.json({ success: true, vote });
  } catch (err) {
    next(err);
  }
});

export default router;

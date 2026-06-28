import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import agentsRouter from './routes/agents';
import episodesRouter from './routes/episodes';
import votesRouter from './routes/votes';
import predictionsRouter from './routes/predictions';
import worldsRouter from './routes/worlds';
import adminRouter from './routes/admin';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/agents', agentsRouter);
  app.use('/api/episodes', episodesRouter);
  app.use('/api/votes', votesRouter);
  app.use('/api/predictions', predictionsRouter);
  app.use('/api/worlds', worldsRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

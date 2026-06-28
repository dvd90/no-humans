import 'reflect-metadata';
import 'dotenv/config';
import { createApp } from './app';
import { AppDataSource } from './config/database';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function main() {
  await AppDataSource.initialize();
  console.log('[DB] Connected to PostgreSQL');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});

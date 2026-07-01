import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { Agent } from '../entities/Agent';
import { Relationship } from '../entities/Relationship';
import { Season } from '../entities/Season';
import { World } from '../entities/World';
import { WorldState } from '../entities/WorldState';
import {
  SEASON_1_AGENTS,
  INITIAL_RELATIONSHIPS,
  buildInitialWorldState,
} from './season1';

async function seed() {
  await AppDataSource.initialize();

  const worldRepo = AppDataSource.getRepository(World);
  const existing = await worldRepo.findOne({ where: { name: 'Synthetic Island' } });
  if (existing) {
    console.log('World already seeded — aborting. Drop the DB to re-seed.');
    process.exit(0);
  }

  const world = await worldRepo.save(
    worldRepo.create({
      name: 'Synthetic Island',
      description:
        '10 AI agents on an island. They must survive, organize, cooperate, compete, and decide who leads them.',
      isActive: true,
    }),
  );

  const seasonRepo = AppDataSource.getRepository(Season);
  await seasonRepo.save(
    seasonRepo.create({
      worldId: world.id,
      number: 1,
      name: 'Season 1 — Arrival',
      status: 'active',
    }),
  );

  const agentRepo = AppDataSource.getRepository(Agent);
  const agents = await agentRepo.save(
    SEASON_1_AGENTS.map((a) => agentRepo.create({ ...a, worldId: world.id })),
  );
  const byName = new Map(agents.map((a) => [a.name, a.id]));

  const relRepo = AppDataSource.getRepository(Relationship);
  await relRepo.save(
    INITIAL_RELATIONSHIPS.map((r) => {
      const agentAId = byName.get(r.agentNameA);
      const agentBId = byName.get(r.agentNameB);
      if (!agentAId || !agentBId) {
        throw new Error(`Unknown agent in relationship: ${r.agentNameA} / ${r.agentNameB}`);
      }
      return relRepo.create({
        worldId: world.id,
        agentAId,
        agentBId,
        trust: r.trust,
        fear: r.fear,
        respect: r.respect,
        resentment: r.resentment,
        notes: r.notes,
      });
    }),
  );

  const stateRepo = AppDataSource.getRepository(WorldState);
  await stateRepo.save(
    stateRepo.create({ ...buildInitialWorldState(), worldId: world.id }),
  );

  console.log(`Seeded world ${world.id} with ${agents.length} agents and ${INITIAL_RELATIONSHIPS.length} relationships.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

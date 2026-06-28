import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Agent } from '../entities/Agent';
import { AgentMemory } from '../entities/AgentMemory';
import { Episode } from '../entities/Episode';
import { Prediction } from '../entities/Prediction';
import { Relationship } from '../entities/Relationship';
import { Season } from '../entities/Season';
import { SimulationRun } from '../entities/SimulationRun';
import { Vote } from '../entities/Vote';
import { World } from '../entities/World';
import { WorldEvent } from '../entities/WorldEvent';
import { WorldState } from '../entities/WorldState';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Agent,
    AgentMemory,
    Episode,
    Prediction,
    Relationship,
    Season,
    SimulationRun,
    Vote,
    World,
    WorldEvent,
    WorldState,
  ],
  migrations: ['dist/migrations/**/*.js'],
});

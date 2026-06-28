import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agent } from './Agent';

export type MemoryType = 'event' | 'relationship_change' | 'observation' | 'decision';

@Entity('agent_memories')
export class AgentMemory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  agentId!: string;

  @Column()
  episodeId!: string;

  @Column({ type: 'enum', enum: ['event', 'relationship_change', 'observation', 'decision'] })
  type!: MemoryType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', default: 5 })
  importance!: number;

  @ManyToOne(() => Agent, (agent) => agent.memories)
  agent!: Agent;

  @CreateDateColumn()
  createdAt!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgentMemory } from './AgentMemory';
import { World } from './World';

export type AgentStatus = 'active' | 'injured' | 'exiled' | 'dead';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  name!: string;

  @Column()
  role!: string;

  @Column({ type: 'text' })
  personality!: string;

  @Column({ type: 'text' })
  goal!: string;

  @Column({ type: 'simple-array' })
  fears!: string[];

  @Column({ type: 'simple-array' })
  values!: string[];

  @Column({
    type: 'enum',
    enum: ['active', 'injured', 'exiled', 'dead'],
    default: 'active',
  })
  status!: AgentStatus;

  @Column({ type: 'int', default: 100 })
  energy!: number;

  @Column({ type: 'int', default: 50 })
  trustScore!: number;

  @Column({ type: 'int', default: 50 })
  publicReputation!: number;

  @ManyToOne(() => World, (world) => world.agents)
  world!: World;

  @OneToMany(() => AgentMemory, (memory) => memory.agent)
  memories!: AgentMemory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

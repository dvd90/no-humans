import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('simulation_runs')
export class SimulationRun {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column({ nullable: true })
  episodeId!: string | null;

  @Column({ type: 'enum', enum: ['running', 'completed', 'failed'], default: 'running' })
  status!: 'running' | 'completed' | 'failed';

  @Column({ type: 'jsonb', default: '{}' })
  inputSnapshot!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: '[]' })
  proposedActions!: unknown[];

  @Column({ type: 'jsonb', default: '[]' })
  resolvedEvents!: unknown[];

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}

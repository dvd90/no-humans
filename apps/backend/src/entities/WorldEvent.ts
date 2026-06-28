import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from './Episode';

@Entity('world_events')
export class WorldEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  episodeId!: string;

  @Column()
  day!: number;

  @Column()
  type!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-array', default: '' })
  involvedAgentIds!: string[];

  @Column({ type: 'jsonb', default: '{}' })
  stateChanges!: Record<string, unknown>;

  @Column({ type: 'int', default: 5 })
  importance!: number;

  @ManyToOne(() => Episode, (episode) => episode.events)
  episode!: Episode;

  @CreateDateColumn()
  createdAt!: Date;
}

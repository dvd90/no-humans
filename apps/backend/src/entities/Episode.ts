import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prediction } from './Prediction';
import { Season } from './Season';
import { Vote } from './Vote';
import { WorldEvent } from './WorldEvent';

export type EpisodeStatus = 'draft' | 'published';

@Entity('episodes')
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  seasonId!: string;

  @Column()
  number!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  previouslySummary!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'jsonb', default: '[]' })
  mainEvents!: { order: number; description: string; involvedAgents: string[] }[];

  @Column({ type: 'text' })
  cliffhanger!: string;

  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'draft' })
  status!: EpisodeStatus;

  @Column({ nullable: true })
  publishedAt!: Date | null;

  @ManyToOne(() => Season, (season) => season.episodes)
  season!: Season;

  @OneToMany(() => WorldEvent, (event) => event.episode)
  events!: WorldEvent[];

  @OneToMany(() => Prediction, (prediction) => prediction.episode)
  predictions!: Prediction[];

  @OneToMany(() => Vote, (vote) => vote.episode)
  votes!: Vote[];

  @CreateDateColumn()
  createdAt!: Date;
}

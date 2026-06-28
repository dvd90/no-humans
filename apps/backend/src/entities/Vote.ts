import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from './Episode';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  episodeId!: string;

  @Column()
  optionA!: string;

  @Column()
  optionB!: string;

  @Column()
  optionC!: string;

  @Column()
  optionD!: string;

  @Column({ type: 'int', default: 0 })
  votesA!: number;

  @Column({ type: 'int', default: 0 })
  votesB!: number;

  @Column({ type: 'int', default: 0 })
  votesC!: number;

  @Column({ type: 'int', default: 0 })
  votesD!: number;

  @Column({ type: 'enum', enum: ['A', 'B', 'C', 'D'], nullable: true })
  winnerId!: 'A' | 'B' | 'C' | 'D' | null;

  @Column()
  closesAt!: Date;

  @ManyToOne(() => Episode, (episode) => episode.votes)
  episode!: Episode;

  @CreateDateColumn()
  createdAt!: Date;
}

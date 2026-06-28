import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from './Episode';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  episodeId!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column()
  optionA!: string;

  @Column()
  optionB!: string;

  @Column({ type: 'enum', enum: ['A', 'B'], nullable: true })
  correctAnswer!: 'A' | 'B' | null;

  @Column({ nullable: true })
  resolvedAt!: Date | null;

  @ManyToOne(() => Episode, (episode) => episode.predictions)
  episode!: Episode;

  @CreateDateColumn()
  createdAt!: Date;
}

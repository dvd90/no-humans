import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from './Episode';
import { World } from './World';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  number!: number;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: ['active', 'completed', 'archived'], default: 'active' })
  status!: 'active' | 'completed' | 'archived';

  @Column({ nullable: true })
  endedAt!: Date | null;

  @ManyToOne(() => World, (world) => world.seasons)
  world!: World;

  @OneToMany(() => Episode, (episode) => episode.season)
  episodes!: Episode[];

  @CreateDateColumn()
  createdAt!: Date;
}

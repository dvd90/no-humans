import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agent } from './Agent';
import { Season } from './Season';

@Entity('worlds')
export class World {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Agent, (agent) => agent.world)
  agents!: Agent[];

  @OneToMany(() => Season, (season) => season.world)
  seasons!: Season[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

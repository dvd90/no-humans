import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('world_states')
export class WorldState {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  day!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 70 })
  food!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 80 })
  water!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 30 })
  shelterQuality!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 60 })
  morale!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 20 })
  conflictLevel!: number;

  @Column({ type: 'text', nullable: true })
  leadershipStructure!: string | null;

  @Column({ type: 'simple-array', default: '' })
  factions!: string[];

  @Column({ type: 'text', nullable: true })
  activeCrisis!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

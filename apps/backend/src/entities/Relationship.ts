import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('relationships')
export class Relationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  worldId!: string;

  @Column()
  agentAId!: string;

  @Column()
  agentBId!: string;

  /** -100 (deep distrust) to 100 (deep trust) */
  @Column({ type: 'int', default: 0 })
  trust!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 0 })
  fear!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 0 })
  respect!: number;

  /** 0–100 */
  @Column({ type: 'int', default: 0 })
  resentment!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}

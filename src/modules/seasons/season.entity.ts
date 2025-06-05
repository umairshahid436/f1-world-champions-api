import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Driver } from '../../entities/driver.entity';
import { Race } from '../races/race.entity';

@Entity('seasons')
export class Season {
  @PrimaryColumn({ type: 'integer' })
  year!: number;

  @Column({ type: 'varchar', length: 50 })
  champion_driver_id!: string;

  @Column({ type: 'integer', nullable: true })
  total_races!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'champion_driver_id' })
  champion_driver!: Driver;

  @OneToMany(() => Race, (race) => race.season)
  races!: Race[];
}

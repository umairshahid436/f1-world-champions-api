import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Season } from './season.entity';

@Entity('races')
@Index(['seasonYear'])
@Index(['driverId'])
export class Race {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 10 })
  date!: string;

  @Column({ type: 'varchar', length: 10 })
  time!: string;

  @Column({ type: 'varchar', length: 10 })
  points!: string;

  @Column({ type: 'varchar', length: 100 })
  circuitName!: string;

  @Column({ type: 'varchar', length: 50 })
  driverId!: string;

  @Column({ type: 'integer' })
  seasonYear!: number;
  constructor(data: Partial<Race>) {
    Object.assign(this, data);
  }
  @UpdateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Season, (season) => season.races)
  @JoinColumn({ name: 'seasonYear' })
  season!: Season;

  @ManyToOne(() => Driver, (driver) => driver.races)
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;
}

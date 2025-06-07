import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  // UpdateDateColumn,
  ManyToOne,
  // OneToMany,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Constructor } from './constructor.entity';
// import { Race } from './race.entity';

@Entity('seasons')
export class Season {
  @PrimaryColumn({ type: 'integer' })
  year!: number;

  @Column({ type: 'varchar', length: 10 })
  round!: string;

  @Column({ type: 'varchar', length: 10 })
  position!: string;

  @Column({ type: 'varchar', length: 10 })
  positionText!: string;

  @Column({ type: 'varchar', length: 20 })
  points!: string;

  @Column({ type: 'varchar', length: 10 })
  wins!: string;

  @Column({ type: 'varchar', length: 50 })
  champion_driver_id!: string;

  @Column({ type: 'varchar', length: 50 })
  champion_constructor_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  constructor(data: Partial<Season>) {
    Object.assign(this, data);
  }

  @ManyToOne(() => Driver, (driver) => driver.seasons)
  @JoinColumn({ name: 'champion_driver_id' })
  champion_driver!: Driver;

  @ManyToOne(() => Constructor, (constructor) => constructor.seasons)
  @JoinColumn({ name: 'champion_constructor_id' })
  champion_constructor!: Constructor;

  // @OneToMany(() => Race, (race) => race.season)
  // races!: Race[];
}

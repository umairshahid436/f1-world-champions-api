import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Race } from './race.entity';
import { Constructor } from './constructor.entity';

@Entity('seasons')
export class Season {
  @PrimaryColumn({ type: 'integer' })
  year!: number;

  @Column({ type: 'varchar', length: 20 })
  points!: string;

  @Column({ type: 'varchar', length: 50 })
  championDriverId!: string;

  @Column({ type: 'varchar', length: 50 })
  championConstructorId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  constructor(data: Partial<Season>) {
    Object.assign(this, data);
  }

  @ManyToOne(() => Driver, (driver) => driver.seasons)
  @JoinColumn({ name: 'championDriverId' })
  championDriver!: Driver;

  @ManyToOne(() => Constructor, (constructor) => constructor.seasons)
  @JoinColumn({ name: 'championConstructorId' })
  championConstructor!: Constructor;

  @OneToMany(() => Race, (race) => race.season)
  races!: Race[];
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Season } from './season.entity';
import { Race } from './race.entity';

@Entity('drivers')
@Index(['driverId'])
export class Driver {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  driverId!: string; // This will be driverId from Ergast API

  @Column({ type: 'varchar', length: 100 })
  givenName!: string;

  @Column({ type: 'varchar', length: 100 })
  familyName!: string;

  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  permanentNumber!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  url!: string;

  constructor(data: Partial<Driver>) {
    Object.assign(this, data);
  }

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Season, (season) => season.championDriver)
  seasons!: Season[];

  @OneToMany(() => Race, (race) => race.driver)
  races!: Race[];
}

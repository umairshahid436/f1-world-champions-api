import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  // UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Season } from './season.entity';
// import { Race } from './race.entity';

@Entity('drivers')
export class Driver {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string; // This will be driverId from Ergast API

  @Column({ type: 'varchar', length: 100 })
  given_name!: string;

  @Column({ type: 'varchar', length: 100 })
  family_name!: string;

  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  permanent_number!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  url!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Season, (season) => season.champion_driver)
  seasons!: Season[];

  // @OneToMany(() => Race, (race) => race.winner_driver)
  // race_wins!: Race[];
}

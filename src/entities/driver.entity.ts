import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Season } from '../modules/seasons/season.entity';
import { Race } from '../modules/races/race.entity';

@Entity('drivers')
export class Driver {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  @Column({ type: 'integer', nullable: true })
  permanent_number!: number;

  @Column({ type: 'date', nullable: true })
  date_of_birth!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Season, (season) => season.champion_driver)
  championships!: Season[];

  @OneToMany(() => Race, (race) => race.winner_driver)
  race_wins!: Race[];
}

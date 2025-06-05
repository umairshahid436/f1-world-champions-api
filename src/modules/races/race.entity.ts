import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Driver } from '../../entities/driver.entity';
import { Season } from '../seasons/season.entity';

@Entity('races')
@Index(['season_year', 'round'])
@Index(['winner_driver_id'])
export class Race {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'integer' })
  season_year!: number;

  @Column({ type: 'integer' })
  round!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  circuit_name!: string;

  @Column({ type: 'varchar', length: 50 })
  country!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 50 })
  winner_driver_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_year' })
  season!: Season;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'winner_driver_id' })
  winner_driver!: Driver;
}

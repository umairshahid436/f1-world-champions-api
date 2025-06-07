import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  // UpdateDateColumn,
} from 'typeorm';
import { Season } from './season.entity';
// import { Race } from './race.entity';

@Entity('constructors')
export class Constructor {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  constructorId!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  @Column({ type: 'varchar', length: 200 })
  url!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Season, (season) => season.champion_constructor)
  seasons!: Season[];

  // @OneToMany(() => Race, (race) => race.winner_driver)
  // race_wins!: Race[];
}

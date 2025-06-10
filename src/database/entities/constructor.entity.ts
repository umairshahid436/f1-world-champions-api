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

@Entity('constructors')
@Index(['constructorId'])
export class Constructor {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  constructorId!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  @Column({ type: 'varchar', length: 200 })
  url!: string;

  constructor(data: Partial<Constructor>) {
    Object.assign(this, data);
  }

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Season, (season) => season.championConstructor)
  seasons!: Season[];

  @OneToMany(() => Race, (race) => race.id)
  races!: Race[];
}

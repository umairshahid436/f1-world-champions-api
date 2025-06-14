import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Race } from '../../../database/entities/race.entity';
import { Season } from '../../../database/entities/season.entity';
import { Driver } from '../../../database/entities/driver.entity';

@Injectable()
export class RaceRepository {
  constructor(
    @InjectRepository(Race)
    private readonly repository: Repository<Race>,
  ) {}

  async findRacesWithChampionFlag(year: number) {
    return this.repository
      .createQueryBuilder('r')
      .leftJoin(Driver, 'd', 'd.driverId = r.driverId')
      .leftJoin(
        Season,
        's',
        's.year = r.seasonYear AND s.championDriverId = d.driverId',
      )
      .select([
        'r.id as "id"',
        'r.name as "name"',
        'r.circuitName as "circuitName"',
        'r.date as "date"',
        'r.time as "time"',
        "json_build_object('driverId', d.driverId, 'name', d.givenName || ' ' || d.familyName, 'isChampion', CASE WHEN s.year IS NOT NULL THEN TRUE ELSE FALSE END) as \"winnerDriver\"",
      ])
      .where('r.seasonYear = :year', { year })
      .getRawMany();
  }

  async saveInTransaction(
    races: Race[],
    manager: EntityManager,
  ): Promise<void> {
    // Upserting on the natural key `name` ensures that if a race with the
    // same name already exists, it gets updated.
    await manager.upsert(Race, races, ['name']);
  }
}

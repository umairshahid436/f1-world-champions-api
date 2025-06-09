import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Race } from '@entities/race.entity';

@Injectable()
export class RacesRepository {
  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
  ) {}

  /* Find races by season year */
  async findBySeasonYear(year: number): Promise<Race[]> {
    return this.raceRepository
      .createQueryBuilder('race')
      .leftJoinAndSelect('race.driver', 'driver')
      .where('race.season = :year', { year })
      .getMany();
  }

  async upsertRaceDataWithTransaction(races: Race[], manager: EntityManager) {
    await manager.upsert(Race, races, ['id']);
  }
}

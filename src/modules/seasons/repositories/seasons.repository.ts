import { Injectable } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { Season } from '@entities/season.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeasonsRepository {
  constructor(
    @InjectRepository(Season)
    private readonly repository: Repository<Season>,
  ) {}

  async findByYearRange(fromYear: number, toYear: number): Promise<Season[]> {
    return this.repository
      .createQueryBuilder('season')
      .leftJoinAndSelect('season.championDriver', 'driver')
      .leftJoinAndSelect('season.championConstructor', 'constructor')
      .where('season.year BETWEEN :fromYear AND :toYear', { fromYear, toYear })
      .select([
        'season.year',
        'season.points',
        'season.championDriverId',
        'season.championConstructorId',
        'driver.driverId',
        'driver.givenName',
        'driver.familyName',
        'driver.nationality',
        'driver.permanentNumber',
        'constructor.constructorId',
        'constructor.name',
        'constructor.nationality',
      ])
      .orderBy('season.year', 'DESC')
      .getMany();
  }

  async upsertSeasonsWithTransaction(
    seasons: Partial<Season>[],
    manager: EntityManager,
  ): Promise<void> {
    await manager.upsert(Season, seasons, ['year']);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '../../external/ergast/ergast.service';
import { RaceDataTransformationService } from './data-transformation.service';
import { ErgastRace } from '../../external/ergast/ergast.interface';
import { DriversService } from '../../drivers/drivers.service';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Race } from '../../../database/entities/race.entity';
import { SeasonsService } from '../../seasons/services/seasons.service';

@Injectable()
export class RacesService {
  private readonly logger = new Logger(RacesService.name);

  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    private readonly entityManager: EntityManager,
    private readonly ergastService: ErgastService,
    private readonly raceDataTransformationService: RaceDataTransformationService,
    private readonly driversService: DriversService,
    private readonly seasonsService: SeasonsService,
  ) {}

  async getSeasonRaces(year: number) {
    this.logger.log(`Requesting races for season ${year}`);
    try {
      // Check if data exists in database
      const racesFromDB = await this.findByRacesBySeasonId(year);
      if (racesFromDB.length > 0) {
        this.logger.log(`Race data found in database for ${year}`);
        return racesFromDB;
      }

      // Fetch data from External API (ergast)
      this.logger.log(`Race data not found in database for ${year}`);
      this.logger.log(`Fetching race data from External API (ergast)`);

      const ergastRaces = await this.ergastService.fetchSeasonRaces({
        year,
        positionToFilterResult: 1,
      });
      this.logger.log(`Race data fetched from External API (ergast)`);

      if (ergastRaces.length > 0) {
        const seasonExists = await this.seasonsService.findByYear(year);
        if (!seasonExists) {
          throw new Error(`Season ${year} not exist`);
        } else {
          const savedRaces = await this.saveRaces(ergastRaces);
          this.logger.log(`Races saved to database for ${year}`);
          return savedRaces;
        }
      }
      return [];
    } catch (error) {
      this.logger.error(error);
      throw new Error('Something went wrong while getting races');
    }
  }

  // in actual getting by season id
  // confusion is year is treated as PK/FK
  private async findByRacesBySeasonId(year: number): Promise<Race[]> {
    return this.raceRepository.find({
      where: {
        seasonYear: year,
      },
      relations: {
        driver: true,
      },
    });
  }

  private async saveRaces(ergastRaces: ErgastRace[]) {
    const transformedData =
      this.raceDataTransformationService.transformErgastRaceToDbEntities(
        ergastRaces,
      );

    const { drivers, races } = transformedData;

    await this.entityManager.transaction(async (manager) => {
      await this.driversService.upsertDriversWithTransaction(drivers, manager);

      await manager.upsert(Race, races, ['id']);
    });
    return races;
  }
}

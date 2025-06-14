import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '../../external/ergast/ergast.service';
import { RaceDataTransformationService } from './data-transformation.service';
import { ErgastRace } from '../../external/ergast/ergast.interface';
import { DriversService } from '../../drivers/drivers.service';
import { EntityManager } from 'typeorm';
import { SeasonsService } from '../../seasons/services/seasons.service';
import { RaceRepository } from '../repositories/race.repository';
import { RaceDto } from '../dtos/race.dto';

@Injectable()
export class RacesService {
  private readonly logger = new Logger(RacesService.name);

  constructor(
    private readonly raceRepository: RaceRepository,
    private readonly entityManager: EntityManager,
    private readonly ergastService: ErgastService,
    private readonly rTransformationService: RaceDataTransformationService,
    private readonly driversService: DriversService,
    private readonly seasonsService: SeasonsService,
  ) {}

  async getSeasonRaces(year: number): Promise<RaceDto[]> {
    this.logger.log(`Requesting races for season ${year}`);

    try {
      // Step 1: Always ensure the season champion data is loaded first.
      const season = await this.seasonsService.fetchSeasonChampionId(year);

      if (season?.championDriverId) {
        // Step 2: Now, check if races for this season are in our database.
        const racesFromDb =
          await this.raceRepository.findRacesWithChampionFlag(year);

        if (racesFromDb.length > 0) {
          this.logger.log(`Race data found in database for ${year}`);
          return racesFromDb as RaceDto[];
        }

        // Step 3: If no races in DB, fetch from the external API.
        this.logger.log(`Fetching race data from Ergast for ${year}`);
        const ergastRaces = await this.ergastService.fetchSeasonRaces({
          year,
          positionToFilterResult: 1,
        });

        if (ergastRaces.length === 0) {
          this.logger.log(`No race data found in Ergast API for ${year}`);
          return [];
        }

        // Step 4: Save the new race data.
        await this.saveRaces(ergastRaces);
        this.logger.log(`Races saved to database for ${year}`);

        // Step 5: Re-query using our efficient method to get the final DTO.
        // This is better than transforming in memory because the query builder
        // is more robust and handles all relations and flags correctly.
        const finalRaces =
          await this.raceRepository.findRacesWithChampionFlag(year);

        return finalRaces as RaceDto[];
      }
      this.logger.log(`Season ${year} does not exist.`);
      return [];
    } catch (error) {
      this.logger.error(error);
      throw new Error('Something went wrong while getting races');
    }
  }

  private async saveRaces(ergastRaces: ErgastRace[]): Promise<void> {
    const transformedData =
      this.rTransformationService.transformErgastRaceToDbEntities(ergastRaces);
    const { drivers, races } = transformedData;
    await this.entityManager.transaction(async (manager) => {
      await this.driversService.upsertDriversWithTransaction(drivers, manager);
      await this.raceRepository.saveInTransaction(races, manager);
    });
  }
}

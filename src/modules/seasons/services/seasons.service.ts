import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '@modules/external/ergast/ergast.service';
import { DataTransformationService } from './data-transformation.service';
import { SeasonsRepository } from '@modules/seasons/repositories/seasons.repository';
import { Season } from '@entities/season.entity';
import { ErgastDriverStanding } from '@modules/external/ergast/ergast.interface';
import { DriversService } from '@modules/drivers/drivers.service';
import { ConstructorsService } from '@modules/constructors/constructors.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(
    private readonly seasonsRepository: SeasonsRepository,
    private readonly ergastService: ErgastService,
    private readonly dataTransformationService: DataTransformationService,
    private readonly driversService: DriversService,
    private readonly constructorsService: ConstructorsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Main method: Get seasons data
   * Check DB first, fetch from API if missing
   */
  async getSeasonsChampions(
    fromYear: number,
    toYear: number,
  ): Promise<Season[]> {
    this.logger.log(`Requesting seasons ${fromYear}-${toYear}`);
    try {
      // Check if data exists in database
      this.logger.log(
        `Checking if seasons for ${fromYear}-${toYear} exists in db`,
      );

      const seasonsFromDB = await this.seasonsRepository.findByYearRange(
        fromYear,
        toYear,
      );
      if (seasonsFromDB.length > 0) {
        this.logger.log(`Seasons for ${fromYear}-${toYear} found in database`);
        return seasonsFromDB;
      }

      // Fetch data from External API (ergast)
      this.logger.log(
        `Seasons for for ${fromYear}-${toYear} not found in database`,
      );
      this.logger.log(`Fetching data from External API (ergast)`);

      const seasonsFromApi = await this.ergastService.fetchSeasonChampions(
        fromYear,
        toYear,
      );

      if (seasonsFromApi.length > 0) {
        const savedSeasons = await this.saveSeasons(seasonsFromApi);
        return savedSeasons.sort((a, b) => b.year - a.year);
      }

      return [];
    } catch (error) {
      this.logger.error(`Failed to get seasons`, error);
      throw new Error(
        `Failed to get seasons: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async saveSeasons(ergastDriverStandings: ErgastDriverStanding[]) {
    try {
      // Transform API data to database format
      const transformedData =
        this.dataTransformationService.transformErgastDriverStandingsToEntities(
          ergastDriverStandings,
        );

      const { drivers, constructors, seasons } = transformedData;
      // Batch save to database

      await this.dataSource.transaction(async (manager) => {
        await this.driversService.upsertDriversWithTransaction(
          drivers,
          manager,
        );

        await this.constructorsService.upsertConstructorsWithTransaction(
          constructors,
          manager,
        );

        await this.seasonsRepository.upsertSeasonsWithTransaction(
          seasons,
          manager,
        );
      });

      return transformedData.seasons;
    } catch (error) {
      this.logger.error('Failed to save season data:', error);
      throw new Error(
        `failed to save season error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

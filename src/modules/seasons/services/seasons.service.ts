import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '@modules/external/ergast/ergast.service';
import { DataTransformationService } from './data-transformation.service';
import { SeasonsRepository } from '@modules/seasons/repositories/seasons.repository';
import { Season } from '@entities/season.entity';
import { ErgastDriverStanding } from '@modules/external/ergast/ergast.interface';

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(
    private readonly seasonsRepository: SeasonsRepository,
    private readonly ergastService: ErgastService,
    private readonly dataTransformationService: DataTransformationService,
  ) {}

  /**
   * Main method: Get seasons data with automatic caching
   * Cache-aside pattern: Check DB first, fetch from API if missing
   */
  async getSeasonsChampions(
    fromYear: number,
    toYear: number,
  ): Promise<Season[]> {
    this.logger.log(`Requesting seasons ${fromYear}-${toYear}`);
    try {
      // Check if data exists in database
      const seasonsFromDB = await this.seasonsRepository.findByYearRange(
        fromYear,
        toYear,
      );
      if (seasonsFromDB.length > 0) {
        this.logger.log(`Data found in database`);
        return seasonsFromDB;
      }

      // Fetch data from External API (ergast)
      this.logger.log(`Data not found in database`);
      this.logger.log(`Fetching data from External API (ergast)`);

      const seasonsFromApi = await this.ergastService.fetchSeasonChampions(
        fromYear,
        toYear,
      );

      if (seasonsFromApi.length > 0) {
        const savedSeasons = await this.saveSeasons(seasonsFromApi);
        this.logger.log(`Seasons saved to database`);
        return savedSeasons;
      }

      return [];
    } catch (error) {
      this.logger.error(`Failed to get seasons`, error);
      throw new Error(
        `Failed to get seasons: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async saveSeasons(
    dataFromApi: ErgastDriverStanding[],
  ): Promise<Season[]> {
    try {
      // Transform API data to database format
      const transformedData =
        this.dataTransformationService.transformErgastApiDataToDbEntities(
          dataFromApi,
        );

      // Batch save to database
      await this.seasonsRepository.batchUpsertSeasonData(
        transformedData.drivers,
        transformedData.constructors,
        transformedData.seasons,
      );

      this.logger.log(` Successfully cached  constructors`);
      return transformedData.seasons;
    } catch (error) {
      this.logger.error('Failed to cache season data:', error);
      throw new Error(
        `Caching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

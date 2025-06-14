import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '../../external/ergast/ergast.service';
import {
  DataTransformationService,
  TransformedSeasonData,
} from './data-transformation.service';
import { Season } from '../../../database/entities/season.entity';
import { DriversService } from '../../drivers/drivers.service';
import { ConstructorsService } from '../../constructors/constructors.service';
import { Repository, EntityManager, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SeasonQueryDto } from '../dtos/season-query.dto';
import { sortByProperty } from '../../../utils/utils';

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(
    @InjectRepository(Season)
    private readonly repository: Repository<Season>,
    private readonly entityManager: EntityManager,
    private readonly ergastService: ErgastService,
    private readonly dataTransformationService: DataTransformationService,
    private readonly driversService: DriversService,
    private readonly constructorsService: ConstructorsService,
  ) {}

  /**
   * Main method: Get seasons data
   * Checks for missing years in the DB and fetches only them from the API.
   */
  async getSeasonsChampions({
    fromYear,
    toYear,
    sortOrder = 'DESC',
  }: SeasonQueryDto): Promise<Season[]> {
    this.logger.log(
      `Requesting season champions from ${fromYear} to ${toYear}`,
    );

    try {
      const seasonsFromDB = await this.findByYearRange({
        fromYear,
        toYear,
      });
      const yearsFromDB = seasonsFromDB.map((season) => season.year);

      const requestedYears = Array.from(
        { length: toYear - fromYear + 1 },
        (_, i) => fromYear + i,
      );

      const missingYears = requestedYears.filter(
        (year) => !yearsFromDB.includes(year),
      );

      let newSeasons: Season[] = [];
      if (missingYears.length > 0) {
        this.logger.log(`Found missing years: ${missingYears.join(', ')}`);
        const seasonsFromApi =
          await this.fetchAndSaveMissingSeasons(missingYears);
        newSeasons = seasonsFromApi;
      }

      let allSeasons = [...seasonsFromDB, ...newSeasons];

      // sort the final combined array to ensure order is correct
      allSeasons = sortByProperty({
        array: allSeasons,
        property: 'year',
        sortBy: sortOrder,
      });

      return allSeasons;
    } catch (error) {
      this.logger.error(
        'Failed to get seasons champions',
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error(
        `Failed to get seasons: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
  async isSeasonExists(year: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { year },
    });
    return count > 0;
  }
  async fetchSeasonChampionId(
    year: number,
  ): Promise<{ championDriverId: string } | null> {
    return this.repository.findOne({
      where: {
        year: year,
      },
      select: {
        year: true,
        championDriverId: true,
      },
    });
  }
  private async findByYearRange({
    fromYear,
    toYear,
  }: {
    fromYear: number;
    toYear: number;
  }) {
    return this.repository.find({
      where: {
        year: Between(fromYear, toYear),
      },
      relations: {
        championDriver: true,
        championConstructor: true,
      },
    });
  }

  private async fetchAndSaveMissingSeasons(
    missingYears: number[],
  ): Promise<Season[]> {
    const fromYear = Math.min(...missingYears);
    const toYear = Math.max(...missingYears);

    this.logger.log(
      `Fetching missing data from Ergast API for years ${fromYear}-${toYear}`,
    );

    const seasonsFromApi = await this.ergastService.fetchSeasonChampions({
      fromYear,
      toYear,
      positionToFilterResults: 1,
    });

    const seasonsToSave = seasonsFromApi.filter((standing) =>
      missingYears.includes(parseInt(standing.season)),
    );

    if (seasonsToSave.length > 0) {
      const transformedData =
        this.dataTransformationService.transformSeasonsApiDataToEntities(
          seasonsToSave,
        );
      await this.saveSeasons(transformedData);
      return this.dataTransformationService.assembleSeasonsWithRelations(
        transformedData.seasons,
        transformedData.drivers,
        transformedData.constructors,
      );
    }
    return [];
  }

  private async saveSeasons(data: TransformedSeasonData): Promise<void> {
    try {
      const { drivers, constructors, seasons } = data;

      await this.entityManager.transaction(async (manager) => {
        if (drivers.length > 0) {
          await this.driversService.upsertDriversWithTransaction(
            drivers,
            manager,
          );
        }
        if (constructors.length > 0) {
          await this.constructorsService.upsertConstructorsWithTransaction(
            constructors,
            manager,
          );
        }
        await manager.upsert(Season, seasons, ['year']);
      });
    } catch (error) {
      this.logger.error(
        'Failed to save seasons',
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error(
        `failed to save season error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '@modules/external/ergast/ergast.service';
import { DataTransformationService } from './data-transformation.service';
import { Season } from '@src/database/entities/season.entity';
import { ErgastDriverStanding } from '@modules/external/ergast/ergast.interface';
import { DriversService } from '@modules/drivers/drivers.service';
import { ConstructorsService } from '@modules/constructors/constructors.service';
import { Repository, EntityManager, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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

      const seasonsFromDB = await this.findByYearRange(fromYear, toYear);
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
      this.logger.error(error);
      throw new Error(
        `Failed to get seasons: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  findByYear(year: number): Promise<Season | null> {
    return this.repository.findOne({
      where: { year },
      select: {
        year: true,
      },
    });
  }

  private async findByYearRange(fromYear: number, toYear: number) {
    return this.repository.find({
      where: {
        year: Between(fromYear, toYear),
      },
      relations: {
        championDriver: true,
        championConstructor: true,
      },
      order: {
        year: 'DESC',
      },
    });
  }
  private async saveSeasons(ergastDriverStandings: ErgastDriverStanding[]) {
    try {
      // Transform API data to database format
      const transformedData =
        this.dataTransformationService.transformErgastDriverStandingsToEntities(
          ergastDriverStandings,
        );

      const { drivers, constructors, seasons } = transformedData;

      await this.entityManager.transaction(async (manager) => {
        await this.driversService.upsertDriversWithTransaction(
          drivers,
          manager,
        );

        await this.constructorsService.upsertConstructorsWithTransaction(
          constructors,
          manager,
        );

        await manager.upsert(Season, seasons, ['year']);
      });

      return transformedData.seasons;
    } catch (error) {
      throw new Error(
        `failed to save season error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

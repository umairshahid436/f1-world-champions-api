import { Injectable, Logger } from '@nestjs/common';
import { ErgastService } from '../external/ergast/ergast.service';

export interface SeasonWithChampion {
  year: number;
  championName: string;
  championNationality: string;
  totalPoints: number;
  totalWins: number;
  totalRaces: number;
}

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(
    // @InjectRepository(Season)
    // private readonly seasonsRepository: Repository<Season>,
    // @InjectRepository(Driver)
    // private readonly driversRepository: Repository<Driver>,
    private readonly ergastService: ErgastService,
  ) {}
  getSeasonsChampions(fromYear: number, toYear: number) {
    return this.ergastService.fetchSeasonChampions(fromYear, toYear);
  }

  /**
   * Get all seasons with champion data from database
   * @returns Promise<SeasonWithChampion[]>
   */
  // async findAllSeasons(): Promise<SeasonWithChampion[]> {
  //   const seasons = await this.seasonsRepository.find({
  //     relations: ['champion_driver'],
  //     order: { year: 'DESC' },
  //   });

  //   return seasons.map((season) => ({
  //     year: season.year,
  //     championName: season.champion_driver?.name || 'Unknown',
  //     championNationality: season.champion_driver?.nationality || 'Unknown',
  //     totalPoints: 0, // We'll add this when we sync race data
  //     totalWins: 0, // We'll add this when we sync race data
  //     totalRaces: season.total_races || 0,
  //   }));
  // }

  // /**
  //  * Get a specific season by year
  //  * @param year - The season year
  //  * @returns Promise<SeasonWithChampion | null>
  //  */
  // async findSeasonByYear(year: number): Promise<SeasonWithChampion | null> {
  //   const season = await this.seasonsRepository.findOne({
  //     where: { year },
  //     relations: ['champion_driver'],
  //   });

  //   if (!season) {
  //     return null;
  //   }

  //   return {
  //     year: season.year,
  //     championName: season.champion_driver?.name || 'Unknown',
  //     championNationality: season.champion_driver?.nationality || 'Unknown',
  //     totalPoints: 0,
  //     totalWins: 0,
  //     totalRaces: season.total_races || 0,
  //   };
  // }

  // /**
  //  * Sync season champion data from Ergast API to database
  //  * @param year - The season year to sync
  //  * @returns Promise<SeasonWithChampion>
  //  */
  // async syncSeasonFromApi(year: number): Promise<SeasonWithChampion> {
  //   this.logger.log(`Syncing season ${year} from Ergast API`);

  //   // Fetch champion data from API
  //   const championData = await this.f1ApiService.fetchSeasonChampion(year);

  //   if (!championData) {
  //     throw new Error(`No champion data found for season ${year}`);
  //   }

  //   // Create or update driver
  //   const driver = await this.createOrUpdateDriver(championData);

  //   // Create or update season
  //   const season = await this.createOrUpdateSeason(year, driver);

  //   this.logger.log(`Successfully synced season ${year}`);

  //   return {
  //     year: season.year,
  //     championName: driver.name,
  //     championNationality: driver.nationality,
  //     totalPoints: parseInt(championData.points),
  //     totalWins: parseInt(championData.wins),
  //     totalRaces: season.total_races || 0,
  //   };
  // }

  // /**
  //  * Sync multiple seasons (batch operation)
  //  * @param fromYear - Starting year
  //  * @param toYear - Ending year
  //  * @returns Promise<SeasonWithChampion[]>
  //  */
  // async syncMultipleSeasonsFromApi(
  //   fromYear: number,
  //   toYear: number,
  // ): Promise<SeasonWithChampion[]> {
  //   this.logger.log(`Syncing seasons from ${fromYear} to ${toYear}`);

  //   const champions = await this.f1ApiService.fetchMultipleSeasonChampions(
  //     fromYear,
  //     toYear,
  //   );

  //   const syncedSeasons: SeasonWithChampion[] = [];

  //   for (const [year, championData] of champions) {
  //     try {
  //       const syncedSeason = await this.syncSeasonFromApiData(
  //         year,
  //         championData,
  //       );
  //       syncedSeasons.push(syncedSeason);
  //     } catch {
  //       this.logger.warn(`Failed to sync season ${year}`);
  //     }
  //   }

  //   this.logger.log(`Successfully synced ${syncedSeasons.length} seasons`);
  //   return syncedSeasons;
  // }

  // /**
  //  * Helper method to sync season from already fetched API data
  //  */
  // private async syncSeasonFromApiData(
  //   year: number,
  //   championData: ErgastDriverStanding,
  // ): Promise<SeasonWithChampion> {
  //   const driver = await this.createOrUpdateDriver(championData);
  //   const season = await this.createOrUpdateSeason(year, driver);

  //   return {
  //     year: season.year,
  //     championName: driver.name,
  //     championNationality: driver.nationality,
  //     totalPoints: parseInt(championData.points),
  //     totalWins: parseInt(championData.wins),
  //     totalRaces: season.total_races || 0,
  //   };
  // }

  // /**
  //  * Create or update driver from Ergast API data
  //  */
  // private async createOrUpdateDriver(
  //   championData: ErgastDriverStanding,
  // ): Promise<Driver> {
  //   const existingDriver = await this.driversRepository.findOne({
  //     where: { id: championData.Driver.driverId },
  //   });

  //   const fullName = `${championData.Driver.givenName} ${championData.Driver.familyName}`;

  //   if (existingDriver) {
  //     // Update existing driver with latest data
  //     existingDriver.name = fullName;
  //     existingDriver.nationality = championData.Driver.nationality;
  //     existingDriver.date_of_birth = new Date(championData.Driver.dateOfBirth);
  //     existingDriver.permanent_number = championData.Driver.permanentNumber
  //       ? parseInt(championData.Driver.permanentNumber)
  //       : null;

  //     return await this.driversRepository.save(existingDriver);
  //   }

  //   // Create new driver
  //   const newDriver = this.driversRepository.create({
  //     id: championData.Driver.driverId,
  //     name: fullName,
  //     nationality: championData.Driver.nationality,
  //     date_of_birth: new Date(championData.Driver.dateOfBirth),
  //     permanent_number: championData.Driver.permanentNumber
  //       ? parseInt(championData.Driver.permanentNumber)
  //       : null,
  //   });

  //   return await this.driversRepository.save(newDriver);
  // }

  // /**
  //  * Create or update season
  //  */
  // private async createOrUpdateSeason(
  //   year: number,
  //   championDriver: Driver,
  // ): Promise<Season> {
  //   const existingSeason = await this.seasonsRepository.findOne({
  //     where: { year },
  //   });

  //   if (existingSeason) {
  //     existingSeason.champion_driver_id = championDriver.id;
  //     return await this.seasonsRepository.save(existingSeason);
  //   }

  //   const newSeason = this.seasonsRepository.create({
  //     year,
  //     champion_driver_id: championDriver.id,
  //     total_races: 0, // Will be updated when we add race data
  //   });

  //   return await this.seasonsRepository.save(newSeason);
  // }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, retry, throwError } from 'rxjs';
import {
  ErgastDriverStanding,
  ErgastDriverStandingsResponse,
  ErgastRaceResultsResponse,
  ErgastRace,
} from './ergast.interface';
import { RetryConfig, createRetryConfig } from '@utils/retry.util';

@Injectable()
export class ErgastService {
  private readonly logger = new Logger(`external-api-${ErgastService.name}`);
  private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelay: 30000,
    retryOnStatus: [429, 500],
    logger: this.logger,
  };
  constructor(private readonly httpService: HttpService) {}

  /* Fetch driver standings for a specific season */
  async fetchDriverStandings(
    year: number,
    position: string,
  ): Promise<ErgastDriverStanding[]> {
    const url = `${this.baseUrl}/${year}/driverStandings.json`;

    this.logger.log(`Fetching driver standings for ${year}`);

    const response = await this.makeRequest<ErgastDriverStandingsResponse>(
      url,
      'F1 seasons (driverStanding)',
    );

    const data = response?.MRData.StandingsTable.StandingsLists;

    if (!data.length) {
      this.logger.warn(`No seasons found for year ${year}`);
      return [];
    }

    const champions = data
      .map((x) =>
        x.DriverStandings.filter((y) => y.position === position).map(
          (standing) => ({
            ...standing,
            season: x.season,
            round: x.round,
          }),
        ),
      )
      .flat();

    this.logger.log(
      `Successfully fetched ${champions.length} driver standings for ${year}`,
    );

    return champions;
  }

  /**
   * Fetch champions for multiple seasons
   * Only returns season (position=1)
   */
  async fetchSeasonChampions(
    fromYear: number,
    toYear: number,
  ): Promise<ErgastDriverStanding[]> {
    const champions: ErgastDriverStanding[] = [];
    for (let year = fromYear; year <= toYear; year++) {
      try {
        const standings = await this.fetchDriverStandings(year, '1');
        const champion = standings?.length > 0 ? standings[0] : null;
        if (champion) {
          champions.push(champion);
        }
        // Add small delay to respect API rate limits
        await this.delay(100);
      } catch (err) {
        this.logger.error(err);
        this.logger.error(`Failed to fetch driver standings for year ${year}`);
      }
    }

    this.logger.log(
      `Successfully fetched ${champions.length} driver standings`,
    );
    return champions;
  }

  /**
   * Fetch race results for a specific season with pagination
   * Only returns race winners (position=1) for each race
   */
  async fetchSeasonRaces(year: number): Promise<ErgastRace[]> {
    let allRaces: ErgastRace[] = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    this.logger.log(`Fetching race results for ${year}`);

    do {
      const url = `${this.baseUrl}/${year}/results.json?limit=${limit}&offset=${offset}`;

      this.logger.log(`Fetching races: offset=${offset}, limit=${limit}`);

      const response = await this.makeRequest<ErgastRaceResultsResponse>(
        url,
        'F1 races (results)',
      );

      const races = response?.MRData?.RaceTable?.Races || [];
      total = parseInt(response?.MRData?.total || '0');

      // Filter each race to only include the winner (position=1)
      const racesWithWinners = races
        .map((race) => ({
          ...race,
          Results: race.Results.filter((result) => result.position === '1'),
        }))
        .filter((race) => race.Results.length > 0);

      allRaces = allRaces.concat(racesWithWinners);
      offset += limit;

      this.logger.log(
        `Fetched ${racesWithWinners.length} races with winners (${allRaces.length}/${total} total) for ${year}`,
      );

      // Add delay between requests to respect rate limits
      if (offset < total) {
        await this.delay(200);
      }
    } while (offset < total && total > 0);

    if (!allRaces.length) {
      this.logger.warn(`No races found for year ${year}`);
      return [];
    }

    this.logger.log(
      `Successfully fetched all ${allRaces.length} races with winners for ${year}`,
    );

    return allRaces;
  }
  private async makeRequest<T>(url: string, context: string): Promise<T> {
    const request = this.httpService.get<T>(url);

    const pipe = request.pipe(
      retry(createRetryConfig(this.retryConfig)),
      map((response) => {
        return response.data;
      }),
      catchError((error: Error) => {
        this.logger.error(
          `Failed to make request url: ${url}: ${error.message}`,
          error.stack,
        );

        return throwError(
          () =>
            new InternalServerErrorException(
              `Failed ${context}: ${error.message}`,
            ),
        );
      }),
    );
    return firstValueFrom(pipe);
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

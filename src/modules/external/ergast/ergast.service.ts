import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ErgastDriverStanding,
  ErgastDriverStandingsResponse,
} from './ergast.interface';
import { retryWithBackoff } from '@utils/retry.util';

@Injectable()
export class ErgastService {
  private readonly logger = new Logger(`external-api-${ErgastService.name}`);
  private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch driver standings for a specific season
   * @param year - The season year (e.g., 2023)
   * @param position - Optional position filter (1 for champion only)
   * @returns Promise<ErgastDriverStanding[]>
   */
  async fetchDriverStandings(
    year: number,
    position: string,
  ): Promise<ErgastDriverStanding[]> {
    return retryWithBackoff(
      async () => {
        const url = `${this.baseUrl}/${year}/driverStandings.json`;

        this.logger.log(`Fetching driver standings for ${year}`);

        const response: AxiosResponse<ErgastDriverStandingsResponse> =
          await firstValueFrom(this.httpService.get(url));

        const data = response.data?.MRData?.StandingsTable?.StandingsLists;
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
      },
      `driver standings for year ${year}`,
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        skipRetryOnStatusCodes: [404],
        logger: this.logger,
      },
    );
  }

  /**
   * Fetch the champion (1st position) for a specific season
   * @param year - The season year
   * @returns Promise<ErgastDriverStanding | null>
   */
  async fetchSeasonChampion(
    year: number,
  ): Promise<ErgastDriverStanding | null> {
    const standings = await this.fetchDriverStandings(year, '1');
    return standings.length > 0 ? standings[0] : null;
  }

  /**
   * Fetch champions for multiple seasons
   * @param fromYear - Starting year
   * @param toYear - Ending year
   * @returns Promise<Map<number, ErgastDriverStanding>>
   */
  async fetchSeasonChampions(
    fromYear: number,
    toYear: number,
  ): Promise<ErgastDriverStanding[]> {
    const champions: ErgastDriverStanding[] = [];

    this.logger.log(`Fetching champions for seasons ${fromYear} to ${toYear}`);

    for (let year = fromYear; year <= toYear; year++) {
      try {
        const champion = await this.fetchSeasonChampion(year);
        if (champion) {
          champions.push(champion);
        }

        // Add small delay to respect API rate limits
        // await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        this.logger.warn(`Failed to fetch champion for year ${year}`);
        // Continue with other years instead of failing completely
      }
    }

    this.logger.log(`Successfully fetched ${champions.length} champions`);
    return champions;
  }
}

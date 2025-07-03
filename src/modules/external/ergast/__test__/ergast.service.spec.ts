import { Test, TestingModule } from '@nestjs/testing';
import { ErgastService } from '../ergast.service';
import { HttpClientService } from '../../http.client/http.client.service';
import { Logger } from '@nestjs/common';
import {
  mockDriverStandings2023,
  mockDriverStandings2024,
  mockRaceResults2023,
} from './ergast.mock.data';

describe('ErgastService', () => {
  let ergastService: ErgastService;
  let httpClientService: HttpClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErgastService,
        {
          provide: HttpClientService,
          useValue: {
            makeRequest: jest.fn(),
            delay: jest.fn(),
            setRetryConfig: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    ergastService = module.get<ErgastService>(ErgastService);
    httpClientService = module.get<HttpClientService>(HttpClientService);
  });

  describe('fetchDriverStandings', () => {
    it('should fetch driver standings successfully', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue(
        mockDriverStandings2023,
      );
      const result = await ergastService.fetchDriverStandings(2023);

      expect(result).toHaveLength(1);
      expect(result[0].season).toBe('2023');
      expect(result[0].Driver.driverId).toBe('max_verstappen');
    });

    it('should filter driver standings by position', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue(
        mockDriverStandings2023,
      );

      const result = await ergastService.fetchDriverStandings(2023, 1);

      expect(result).toHaveLength(1);
      expect(result[0].position).toBe('1');
    });

    it('should handle empty response gracefully', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue({
        MRData: {
          StandingsTable: { StandingsLists: [] },
        },
      });

      const result = await ergastService.fetchDriverStandings(2023);

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      (httpClientService.makeRequest as jest.Mock).mockRejectedValue(
        new Error('API request failed'),
      );
      await expect(ergastService.fetchDriverStandings(2023)).rejects.toThrow(
        'API request failed',
      );
    });
  });

  describe('fetchSeasonChampions', () => {
    it('should fetch champions from multiple years successfully', async () => {
      (httpClientService.makeRequest as jest.Mock)
        .mockResolvedValueOnce(mockDriverStandings2023)
        .mockResolvedValueOnce(mockDriverStandings2024);
      const result = await ergastService.fetchSeasonChampions({
        fromYear: 2023,
        toYear: 2024,
      });

      expect(result).toHaveLength(2);
      expect(result[0].season).toBe('2023');
      expect(result[0].Driver.driverId).toBe('max_verstappen');
      expect(result[1].season).toBe('2024');
      expect(result[1].Driver.driverId).toBe('max_verstappen');
    });

    it('should filter champions by position', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue(
        mockDriverStandings2023,
      );
      const result = await ergastService.fetchSeasonChampions({
        fromYear: 2023,
        toYear: 2023,
        positionToFilterResults: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].position).toBe('1');
    });

    it('should handle failed requests gracefully', async () => {
      (httpClientService.makeRequest as jest.Mock)
        .mockResolvedValueOnce(mockDriverStandings2023) // First year succeeds
        .mockRejectedValueOnce(new Error('API request failed')) // Second year fails
        .mockResolvedValueOnce(mockDriverStandings2024);
      const result = await ergastService.fetchSeasonChampions({
        fromYear: 2023,
        toYear: 2025,
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.season === '2023')).toBeTruthy();
      expect(result.some((r) => r.season === '2024')).toBeTruthy();
    });
  });

  describe('fetchSeasonRaces', () => {
    it('should fetch races successfully with pagination', async () => {
      (httpClientService.makeRequest as jest.Mock)
        .mockResolvedValueOnce({
          ...mockRaceResults2023,
          MRData: {
            ...mockRaceResults2023.MRData,
            total: '2',
          },
        })
        // Mock second page
        .mockResolvedValueOnce({
          ...mockRaceResults2023,
          MRData: {
            ...mockRaceResults2023.MRData,
            RaceTable: {
              ...mockRaceResults2023.MRData.RaceTable,
              Races: [
                {
                  ...mockRaceResults2023.MRData.RaceTable.Races[0],
                  round: '2',
                },
              ],
            },
          },
        });

      const result = await ergastService.fetchSeasonRaces({
        year: 2023,
      });

      expect(result).toHaveLength(1);
      expect(result[0].season).toBe('2023');
      expect(result[0].Results).toHaveLength(2);
    });

    it('should filter races by position correctly', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue(
        mockRaceResults2023,
      );

      const result = await ergastService.fetchSeasonRaces({
        year: 2023,
        positionToFilterResult: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].Results[0].position).toBe('1');
    });

    it('should handle empty response', async () => {
      (httpClientService.makeRequest as jest.Mock).mockResolvedValue({
        MRData: {
          RaceTable: { Races: [] },
        },
      });
      const result = await ergastService.fetchSeasonRaces({
        year: 2023,
      });

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      (httpClientService.makeRequest as jest.Mock).mockRejectedValue(
        new Error('API request failed'),
      );
      await expect(
        ergastService.fetchSeasonRaces({
          year: 2023,
        }),
      ).rejects.toThrow('API request failed');
    });
  });
});

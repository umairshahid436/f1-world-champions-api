import { Test, TestingModule } from '@nestjs/testing';
import { ErgastService } from './ergast.service';
import { HttpClientService } from '../http.client/http.client.service';
import {
  ErgastDriverStandingsResponse,
  ErgastRaceResultsResponse,
} from './ergast.interface';
import { ErgastEndpoints } from './ergast.endpoints';
import { mockDriverStandings, mockRaceResults } from './mock/ergast.mock';

describe('ErgastService', () => {
  let service: ErgastService;

  const mockHttpClientService = {
    makeRequest: jest.fn<
      Promise<ErgastDriverStandingsResponse | ErgastRaceResultsResponse>,
      [any]
    >(),
    setRetryConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErgastService,
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
      ],
    }).compile();

    service = module.get<ErgastService>(ErgastService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDriverStandings', () => {
    it('should fetch driver standings successfully', async () => {
      mockHttpClientService.makeRequest.mockResolvedValue(mockDriverStandings);

      const result = await service.fetchDriverStandings(2023);

      expect(result).toHaveLength(1);
      expect(result[0].position).toBe('1');
      expect(result[0].points).toBe('100');
      expect(result[0].Driver.driverId).toBe('max_verstappen');
      expect(result[0].Constructors[0].constructorId).toBe('red_bull');
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.driverStandings(2023),
        method: 'GET',
        context: 'F1 seasons (driverStanding)',
      });
    });

    it('should filter by position when specified', async () => {
      mockHttpClientService.makeRequest.mockResolvedValue(mockDriverStandings);

      const result = await service.fetchDriverStandings(2023, 1);

      expect(result).toHaveLength(1);
      expect(result[0].position).toBe('1');
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.driverStandings(2023),
        method: 'GET',
        context: 'F1 seasons (driverStanding)',
      });
    });

    it('should throw error when API call fails', async () => {
      mockHttpClientService.makeRequest.mockRejectedValue(
        new Error('API Error'),
      );

      await expect(service.fetchDriverStandings(2023)).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('fetchSeasonChampions', () => {
    beforeEach(() => {
      mockHttpClientService.makeRequest.mockResolvedValue(mockDriverStandings);
    });

    it('should fetch champions for multiple years successfully', async () => {
      const result = await service.fetchSeasonChampions({
        fromYear: 2021,
        toYear: 2023,
      });

      expect(result).toHaveLength(3); // One champion per year
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledTimes(3);
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.driverStandings(2021),
        method: 'GET',
        context: 'F1 seasons (driverStanding)',
      });
    });

    it('should filter by position when specified', async () => {
      const result = await service.fetchSeasonChampions({
        fromYear: 2021,
        toYear: 2023,
        positionToFilterResults: 1,
      });

      expect(result).toHaveLength(3);
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.driverStandings(2021),
        method: 'GET',
        context: 'F1 seasons (driverStanding)',
      });
    });

    it('should throw error if any year fails', async () => {
      mockHttpClientService.makeRequest
        .mockResolvedValueOnce(mockDriverStandings)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockDriverStandings);

      await expect(
        service.fetchSeasonChampions({
          fromYear: 2021,
          toYear: 2023,
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('fetchSeasonRaces', () => {
    it('should fetch races for a season successfully', async () => {
      mockHttpClientService.makeRequest.mockResolvedValue(mockRaceResults);

      const result = await service.fetchSeasonRaces({
        year: 2023,
      });

      expect(result).toHaveLength(1);
      expect(result[0].season).toBe('2023');
      expect(result[0].raceName).toBe('Bahrain Grand Prix');
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.results(2023),
        method: 'GET',
        context: 'F1 seasons (race results)',
      });
    });

    it('should filter by position when specified', async () => {
      mockHttpClientService.makeRequest.mockResolvedValue(mockRaceResults);

      const result = await service.fetchSeasonRaces({
        year: 2023,
        positionToFilterResult: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].Results[0].position).toBe('1');
      expect(mockHttpClientService.makeRequest).toHaveBeenCalledWith({
        url: ErgastEndpoints.results(2023),
        method: 'GET',
        context: 'F1 seasons (race results)',
      });
    });

    it('should throw error when API call fails', async () => {
      mockHttpClientService.makeRequest.mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        service.fetchSeasonRaces({
          year: 2023,
        }),
      ).rejects.toThrow('API Error');
    });
  });
});

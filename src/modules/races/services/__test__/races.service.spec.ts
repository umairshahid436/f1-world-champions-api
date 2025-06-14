import { Test, TestingModule } from '@nestjs/testing';
import { RacesService } from '../races.service';
import { RaceRepository } from '../../repositories/race.repository';
import { EntityManager } from 'typeorm';
import { ErgastService } from '../../../external/ergast/ergast.service';
import { RaceDataTransformationService } from '../data-transformation.service';
import { DriversService } from '../../../drivers/drivers.service';
import { SeasonsService } from '../../../seasons/services/seasons.service';
import { ErgastRace } from '../../../external/ergast/ergast.interface';

const mockRaceRepository = {
  findRacesWithChampionFlag: jest.fn(),
  saveInTransaction: jest.fn(),
};

const mockErgastService = {
  fetchSeasonRaces: jest.fn(),
};

const mockRTransformationService = {
  transformErgastRaceToDbEntities: jest.fn(),
};

const mockDriversService = {
  upsertDriversWithTransaction: jest.fn(),
};

const mockSeasonsService = {
  fetchSeasonChampionId: jest.fn(),
};

const mockEntityManager = {
  transaction: jest.fn().mockImplementation(async (cb) => {
    // This simulates the transaction callback
    const manager = {}; // Mock manager if needed within the callback
    await cb(manager);
  }),
};

describe('RacesService', () => {
  let service: RacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        { provide: RaceRepository, useValue: mockRaceRepository },
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ErgastService, useValue: mockErgastService },
        {
          provide: RaceDataTransformationService,
          useValue: mockRTransformationService,
        },
        { provide: DriversService, useValue: mockDriversService },
        { provide: SeasonsService, useValue: mockSeasonsService },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSeasonRaces', () => {
    const year = 2023;
    const mockSeason = {
      id: '1',
      year: 2023,
      championDriverId: 'max_verstappen',
    };
    // This now represents the raw data returned by the repository query
    const mockRawRacesFromDb = [
      {
        id: 'race-1',
        name: 'Bahrain Grand Prix',
        circuitName: 'Bahrain International Circuit',
        date: '2023-03-05',
        time: '15:00:00Z',
        winnerDriver: {
          driverId: 'max_verstappen',
          name: 'Max Verstappen',
          isChampion: true,
        },
      },
    ];

    it('should return an empty array if the season does not exist', async () => {
      mockSeasonsService.fetchSeasonChampionId.mockResolvedValue(null);

      const result = await service.getSeasonRaces(year);

      expect(result).toEqual([]);
      expect(mockSeasonsService.fetchSeasonChampionId).toHaveBeenCalledWith(
        year,
      );
      expect(
        mockRaceRepository.findRacesWithChampionFlag,
      ).not.toHaveBeenCalled();
    });

    it('should return races from the database if they exist', async () => {
      mockSeasonsService.fetchSeasonChampionId.mockResolvedValue(mockSeason);
      mockRaceRepository.findRacesWithChampionFlag.mockResolvedValue(
        mockRawRacesFromDb,
      );

      const result = await service.getSeasonRaces(year);

      expect(result).toEqual(mockRawRacesFromDb);
      expect(mockSeasonsService.fetchSeasonChampionId).toHaveBeenCalledWith(
        year,
      );
      expect(mockRaceRepository.findRacesWithChampionFlag).toHaveBeenCalledWith(
        year,
      );
      expect(mockErgastService.fetchSeasonRaces).not.toHaveBeenCalled();
    });

    it('should fetch, save, and return races if they are not in the database', async () => {
      const mockErgastRaces: ErgastRace[] = [
        {
          season: '2023',
          round: '1',
          url: 'http://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix',
          raceName: 'Bahrain Grand Prix',
          Circuit: {
            circuitId: 'bahrain',
            url: 'http://en.wikipedia.org/wiki/Bahrain_International_Circuit',
            circuitName: 'Bahrain International Circuit',
            Location: {
              lat: '26.0325',
              long: '50.5106',
              locality: 'Sakhir',
              country: 'Bahrain',
            },
          },
          Results: [
            {
              number: '1',
              position: '1',
              positionText: '1',
              points: '25',
              grid: '1',
              laps: '57',
              status: 'Finished',
              Driver: {
                driverId: 'max_verstappen',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_Verstappen',
                givenName: 'Max',
                familyName: 'Verstappen',
                dateOfBirth: '1997-09-30',
                nationality: 'Dutch',
              },
              Constructor: {
                constructorId: 'red_bull',
                url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
                name: 'Red Bull',
                nationality: 'Austrian',
              },
            },
          ],
          date: '2023-03-05',
          time: '15:00:00Z',
        },
      ];
      const mockTransformedData = { drivers: [], races: [] };

      // First call to DB returns nothing
      mockSeasonsService.fetchSeasonChampionId.mockResolvedValue(mockSeason);
      mockRaceRepository.findRacesWithChampionFlag.mockResolvedValueOnce([]);

      // API call returns data
      mockErgastService.fetchSeasonRaces.mockResolvedValue(mockErgastRaces);
      mockRTransformationService.transformErgastRaceToDbEntities.mockReturnValue(
        mockTransformedData,
      );

      // Second call to DB returns the final data
      mockRaceRepository.findRacesWithChampionFlag.mockResolvedValueOnce(
        mockRawRacesFromDb,
      );

      const result = await service.getSeasonRaces(year);

      expect(result).toEqual(mockRawRacesFromDb);
      expect(mockErgastService.fetchSeasonRaces).toHaveBeenCalledWith({
        year,
        positionToFilterResult: 1,
      });
      expect(
        mockRTransformationService.transformErgastRaceToDbEntities,
      ).toHaveBeenCalledWith(mockErgastRaces);
      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(
        mockDriversService.upsertDriversWithTransaction,
      ).toHaveBeenCalled();
      expect(mockRaceRepository.saveInTransaction).toHaveBeenCalled();
      expect(
        mockRaceRepository.findRacesWithChampionFlag,
      ).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if no races are found in the API', async () => {
      mockSeasonsService.fetchSeasonChampionId.mockResolvedValue(mockSeason);
      mockRaceRepository.findRacesWithChampionFlag.mockResolvedValueOnce([]);
      mockErgastService.fetchSeasonRaces.mockResolvedValue([]);

      const result = await service.getSeasonRaces(year);

      expect(result).toEqual([]);
      expect(mockErgastService.fetchSeasonRaces).toHaveBeenCalledWith({
        year,
        positionToFilterResult: 1,
      });
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw a generic error if something goes wrong', async () => {
      mockSeasonsService.fetchSeasonChampionId.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getSeasonRaces(year)).rejects.toThrow(
        'Something went wrong while getting races',
      );
    });
  });
});

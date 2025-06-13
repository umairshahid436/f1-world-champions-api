import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RacesService } from '../races.service';
import { ErgastService } from '../../../external/ergast/ergast.service';
import { RaceDataTransformationService } from '../data-transformation.service';
import { DriversService } from '../../../drivers/drivers.service';
import { SeasonsService } from '../../../seasons/services/seasons.service';
import { Race } from '../../../../database/entities/race.entity';
import { Logger } from '@nestjs/common';
import { ErgastRace } from '../../../external/ergast/ergast.interface';

// Mock Data
const MOCK_YEAR = 2023;
const MOCK_RACES: Race[] = [
  {
    id: 1,
    name: 'Bahrain Grand Prix',
    date: '2023-03-05',
    time: '15:00:00Z',
    seasonYear: MOCK_YEAR,
    driverId: '1',
    points: '25',
    circuitName: 'Bahrain International Circuit',
    driver: {
      driverId: '1',
      givenName: 'Max',
      familyName: 'Verstappen',
      permanentNumber: '1',
      code: 'VER',
      url: '',
      nationality: 'Dutch',
      seasons: [],
      races: [],
      createdAt: new Date(),
    },
    season: {
      year: MOCK_YEAR,
      points: '25',
      championDriverId: '1',
      championConstructorId: '1',
      createdAt: new Date(),
      races: [],
      championDriver: {
        driverId: 'driverId',
        givenName: 'givenName',
        familyName: 'familyName',
        nationality: 'nationality',
        permanentNumber: 'permanentNumber',
        code: 'code',
        url: 'url',
        createdAt: new Date(),
        seasons: [],
        races: [],
      },
      championConstructor: {
        constructorId: 'constructorId',
        name: 'name',
        nationality: 'nationality',
        url: 'url',
        createdAt: new Date(),
        seasons: [],
        races: [],
      },
    },
    createdAt: new Date(),
  },
];

const MOCK_ERGAST_RACES: ErgastRace[] = [
  {
    season: '2023',
    round: '1',
    url: 'http://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix',
    raceName: 'Bahrain Grand Prix',
    date: '2023-03-05',
    time: '15:00:00Z',
    Results: [
      {
        number: '1',
        position: '1',
        positionText: '1',
        points: '25',
        Driver: {
          driverId: 'max_verstappen',
          givenName: 'Max',
          familyName: 'Verstappen',
          nationality: 'Dutch',
          permanentNumber: '1',
          code: 'VER',
          url: '',
          dateOfBirth: '',
        },
        Constructor: {
          constructorId: 'red_bull',
          name: 'Red Bull Racing',
          nationality: 'Austrian',
          url: '',
        },
        grid: '1',
        laps: '57',
        status: 'Finished',
        Time: { millis: '5617062', time: '1:33:56.736' },
        FastestLap: {
          rank: '1',
          lap: '56',
          Time: { time: '1:35.840' },
          AverageSpeed: { units: 'kph', speed: '203.280' },
        },
      },
    ],
    Circuit: {
      circuitId: 'bahrain',
      url: '',
      circuitName: 'Bahrain International Circuit',
      Location: { lat: '', long: '', locality: '', country: '' },
    },
  },
];

describe('RacesService', () => {
  let service: RacesService;
  let repository: jest.Mocked<Repository<Race>>;
  let ergastService: jest.Mocked<ErgastService>;
  let raceDataTransformationService: jest.Mocked<RaceDataTransformationService>;
  let seasonsService: jest.Mocked<SeasonsService>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        {
          provide: getRepositoryToken(Race),
          useValue: { find: jest.fn() },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn().mockImplementation(async (callback) => {
              const mockManager = { upsert: jest.fn() };
              await callback(mockManager);
            }),
          },
        },
        {
          provide: ErgastService,
          useValue: { fetchSeasonRaces: jest.fn() },
        },
        {
          provide: RaceDataTransformationService,
          useValue: { transformErgastRaceToDbEntities: jest.fn() },
        },
        {
          provide: DriversService,
          useValue: { upsertDriversWithTransaction: jest.fn() },
        },
        {
          provide: SeasonsService,
          useValue: { findByYear: jest.fn() },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);
    repository = module.get(getRepositoryToken(Race));
    ergastService = module.get(ErgastService);
    raceDataTransformationService = module.get(RaceDataTransformationService);
    seasonsService = module.get(SeasonsService);
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSeasonRaces', () => {
    it('should return races from the database if they exist', async () => {
      repository.find.mockResolvedValue(MOCK_RACES);

      const result = await service.getSeasonRaces(MOCK_YEAR);
      expect(result).toEqual(MOCK_RACES);
      expect(repository.find).toHaveBeenCalledWith({
        where: { seasonYear: MOCK_YEAR },
        relations: { driver: true },
      });
      expect(ergastService.fetchSeasonRaces).not.toHaveBeenCalled();
    });

    it('should fetch, save, and return races from the API if not in the database', async () => {
      repository.find.mockResolvedValue([]);
      seasonsService.findByYear.mockResolvedValue(MOCK_RACES[0].season);
      ergastService.fetchSeasonRaces.mockResolvedValue(MOCK_ERGAST_RACES);
      raceDataTransformationService.transformErgastRaceToDbEntities.mockReturnValue(
        {
          drivers: [],
          races: MOCK_RACES,
        },
      );
      const result = await service.getSeasonRaces(MOCK_YEAR);
      expect(ergastService.fetchSeasonRaces).toHaveBeenCalledWith({
        year: MOCK_YEAR,
        positionToFilterResult: 1,
      });
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(result).toEqual(MOCK_RACES);
    });

    it('should throw an error if the season does not exist when fetching from API', async () => {
      repository.find.mockResolvedValue([]);
      seasonsService.findByYear.mockResolvedValue(null);
      ergastService.fetchSeasonRaces.mockResolvedValue(MOCK_ERGAST_RACES);
      await expect(service.getSeasonRaces(MOCK_YEAR)).rejects.toThrow(
        'Something went wrong while getting races',
      );
    });

    it('should return an empty array if no races are found in DB or API', async () => {
      repository.find.mockResolvedValue([]);
      ergastService.fetchSeasonRaces.mockResolvedValue([]);
      const result = await service.getSeasonRaces(MOCK_YEAR);
      expect(result).toEqual([]);
      expect(entityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw an error if fetching from the database fails', async () => {
      const dbError = new Error('Database connection failed');
      repository.find.mockRejectedValue(dbError);
      await expect(service.getSeasonRaces(MOCK_YEAR)).rejects.toThrow(
        'Something went wrong while getting races',
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Between, Repository } from 'typeorm';
import { SeasonsService } from '../seasons.service';
import { ErgastService } from '../../../external/ergast/ergast.service';
import { DataTransformationService } from '../data-transformation.service';
import { DriversService } from '../../../drivers/drivers.service';
import { ConstructorsService } from '../../../constructors/constructors.service';
import { Season } from '../../../../database/entities/season.entity';
import { Logger } from '@nestjs/common';
import { ErgastDriverStanding } from '../../../external/ergast/ergast.interface';

// Mock data for reuse
const MOCK_YEAR_RANGE = { fromYear: 2020, toYear: 2021 };
const MOCK_SEASONS: Season[] = [
  { year: 2021, championDriver: {}, championConstructor: {} },
  { year: 2020, championDriver: {}, championConstructor: {} },
] as Season[];

const MOCK_ERGAST_DATA: ErgastDriverStanding[] = [
  {
    season: '2021',
    round: '22',
    position: '1',
    positionText: '1',
    points: '395.5',
    wins: '10',
    Driver: {
      driverId: 'max_verstappen',
      permanentNumber: '33',
      code: 'VER',
      url: 'http://en.wikipedia.org/wiki/Max_Verstappen',
      givenName: 'Max',
      familyName: 'Verstappen',
      dateOfBirth: '1997-09-30',
      nationality: 'Dutch',
    },
    Constructors: [
      {
        constructorId: 'red_bull',
        url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
        name: 'Red Bull Racing Honda',
        nationality: 'Austrian',
      },
    ],
  },
];

describe('SeasonsService', () => {
  let service: SeasonsService;
  let repository: jest.Mocked<Repository<Season>>;
  let ergastService: jest.Mocked<ErgastService>;
  let dataTransformationService: jest.Mocked<DataTransformationService>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonsService,
        {
          provide: getRepositoryToken(Season),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ErgastService,
          useValue: {
            fetchSeasonChampions: jest.fn(),
          },
        },
        {
          provide: DataTransformationService,
          useValue: {
            transformErgastDriverStandingsToEntities: jest.fn(),
          },
        },
        {
          provide: DriversService,
          useValue: {
            upsertDriversWithTransaction: jest.fn(),
          },
        },
        {
          provide: ConstructorsService,
          useValue: {
            upsertConstructorsWithTransaction: jest.fn(),
          },
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
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeasonsService>(SeasonsService);
    repository = module.get(getRepositoryToken(Season));
    ergastService = module.get(ErgastService);
    dataTransformationService = module.get(DataTransformationService);
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSeasonsChampions', () => {
    it('should return seasons from the database if they exist', async () => {
      repository.find.mockResolvedValue(MOCK_SEASONS);

      const result = await service.getSeasonsChampions(MOCK_YEAR_RANGE);

      expect(result).toEqual(MOCK_SEASONS);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          year: Between(MOCK_YEAR_RANGE.fromYear, MOCK_YEAR_RANGE.toYear),
        },
        relations: { championDriver: true, championConstructor: true },
        order: { year: 'DESC' },
      });

      expect(ergastService.fetchSeasonChampions).not.toHaveBeenCalled();
    });

    it('should fetch, save, and return seasons from the API if not in the database', async () => {
      repository.find.mockResolvedValue([]);
      ergastService.fetchSeasonChampions.mockResolvedValue(MOCK_ERGAST_DATA);
      dataTransformationService.transformErgastDriverStandingsToEntities.mockReturnValue(
        {
          drivers: [],
          constructors: [],
          seasons: MOCK_SEASONS,
        },
      );

      const result = await service.getSeasonsChampions(MOCK_YEAR_RANGE);

      expect(ergastService.fetchSeasonChampions).toHaveBeenCalledWith({
        fromYear: MOCK_YEAR_RANGE.fromYear,
        toYear: MOCK_YEAR_RANGE.toYear,
        positionToFilterResults: 1,
      });
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(result).toEqual(MOCK_SEASONS);
    });

    it('should return an empty array if no seasons are found in DB or API', async () => {
      repository.find.mockResolvedValue([]);
      ergastService.fetchSeasonChampions.mockResolvedValue([]);
      const result = await service.getSeasonsChampions(MOCK_YEAR_RANGE);

      expect(result).toEqual([]);
      expect(entityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw an error if fetching from the database fails', async () => {
      const dbError = new Error('Database connection failed');
      repository.find.mockRejectedValue(dbError);
      await expect(
        service.getSeasonsChampions(MOCK_YEAR_RANGE),
      ).rejects.toThrow('Failed to get seasons: Database connection failed');
    });
  });

  describe('findByYear', () => {
    it('should return a single season if found', async () => {
      const year = 2021;
      const mockSeason = MOCK_SEASONS[0];
      repository.findOne.mockResolvedValue(mockSeason);
      const result = await service.findByYear(year);

      expect(result).toEqual(mockSeason);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { year },
        select: { year: true },
      });
    });

    it('should return null if no season is found', async () => {
      const year = 2025;
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByYear(year);

      expect(result).toBeNull();
    });
  });
});

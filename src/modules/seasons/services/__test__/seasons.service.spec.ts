import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository, Between } from 'typeorm';
import { SeasonsService } from '../seasons.service';
import { ErgastService } from '../../../external/ergast/ergast.service';
import {
  DataTransformationService,
  TransformedSeasonData,
} from '../data-transformation.service';
import { DriversService } from '../../../drivers/drivers.service';
import { ConstructorsService } from '../../../constructors/constructors.service';
import { Season } from '../../../../database/entities/season.entity';
import { Logger } from '@nestjs/common';
import { SeasonQueryDto } from '../../dtos/season-query.dto';
import { Driver } from '../../../../database/entities/driver.entity';
import { Constructor } from '../../../../database/entities/constructor.entity';
import { ErgastDriver } from '../../../external/ergast/ergast.interface';

// Mock data for reuse
const MOCK_YEAR_RANGE: SeasonQueryDto = { fromYear: 2020, toYear: 2021 };
const MOCK_DRIVER = new Driver({
  driverId: 'hamilton',
  permanentNumber: '44',
  code: 'HAM',
  url: 'http://en.wikipedia.org/wiki/Lewis_Hamilton',
  givenName: 'Lewis',
  familyName: 'Hamilton',
  nationality: 'British',
});
const MOCK_CONSTRUCTOR = new Constructor({
  constructorId: 'mercedes',
  name: 'Mercedes',
  nationality: 'German',
  url: 'http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One',
});
const MOCK_SEASONS: Season[] = [
  new Season({
    year: 2021,
    championDriver: MOCK_DRIVER,
    championConstructor: MOCK_CONSTRUCTOR,
  }),
  new Season({
    year: 2020,
    championDriver: MOCK_DRIVER,
    championConstructor: MOCK_CONSTRUCTOR,
  }),
];

const MOCK_ERGAST_DRIVER_STANDING = {
  season: '2020',
  round: '17',
  position: '1',
  positionText: '1',
  points: '347',
  wins: '11',
  Driver: MOCK_DRIVER as ErgastDriver,
  Constructors: [MOCK_CONSTRUCTOR],
};

const MOCK_TRANSFORMED_DATA: TransformedSeasonData = {
  drivers: [MOCK_DRIVER],
  constructors: [MOCK_CONSTRUCTOR],
  seasons: [MOCK_SEASONS[1]],
};

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
            count: jest.fn(),
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
            transformSeasonsApiDataToEntities: jest.fn(),
            assembleSeasonsWithRelations: jest.fn(),
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
            transaction: jest
              .fn()
              .mockImplementation(
                async (callback: (manager: unknown) => Promise<void>) => {
                  const mockManager = { upsert: jest.fn() };
                  await callback(mockManager);
                },
              ),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
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
      repository.find.mockResolvedValueOnce(MOCK_SEASONS);

      const result = await service.getSeasonsChampions(MOCK_YEAR_RANGE);

      expect(result).toEqual(MOCK_SEASONS);
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          year: Between(MOCK_YEAR_RANGE.fromYear, MOCK_YEAR_RANGE.toYear),
        },
        relations: { championDriver: true, championConstructor: true },
      });
      expect(ergastService.fetchSeasonChampions).not.toHaveBeenCalled();
    });

    it('should fetch, save, and return seasons when some are missing from the database', async () => {
      // DB has the 2021 season, missing the 2020 season
      repository.find.mockResolvedValueOnce([MOCK_SEASONS[0]]);

      ergastService.fetchSeasonChampions.mockResolvedValue([
        MOCK_ERGAST_DRIVER_STANDING,
      ]);
      dataTransformationService.transformSeasonsApiDataToEntities.mockReturnValue(
        MOCK_TRANSFORMED_DATA,
      );
      dataTransformationService.assembleSeasonsWithRelations.mockReturnValue([
        MOCK_SEASONS[1],
      ]);

      const result = await service.getSeasonsChampions(MOCK_YEAR_RANGE);

      expect(ergastService.fetchSeasonChampions).toHaveBeenCalledWith({
        fromYear: 2020, // Correctly calculated missing year
        toYear: 2020, // Correctly calculated missing year
        positionToFilterResults: 1,
      });
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(result).toEqual([MOCK_SEASONS[0], MOCK_SEASONS[1]]);
    });

    it('should throw an error if fetching from the database fails', async () => {
      const dbError = new Error('Database connection failed');
      repository.find.mockRejectedValue(dbError);
      await expect(
        service.getSeasonsChampions(MOCK_YEAR_RANGE),
      ).rejects.toThrow('Failed to get seasons: Database connection failed');
    });
  });

  describe('isSeasonExists', () => {
    it('should return true if a season exists', async () => {
      repository.count.mockResolvedValue(1);
      const result = await service.isSeasonExists(2021);
      expect(result).toBe(true);
      expect(repository.count).toHaveBeenCalledWith({ where: { year: 2021 } });
    });

    it('should return false if no season is found', async () => {
      repository.count.mockResolvedValue(0);
      const result = await service.isSeasonExists(2025);
      expect(result).toBe(false);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './services/seasons.service';
import { Season } from '@src/database/entities/season.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataTransformationService } from './services/data-transformation.service';
import { DriversService } from '@modules/drivers/drivers.service';
import { ConstructorsService } from '@modules/constructors/constructors.service';
import { ErgastService } from '@modules/external/ergast/ergast.service';

describe('SeasonsController', () => {
  let controller: SeasonsController;

  const mockSeasonsService = {
    getSeasonsChampions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonsController],
      providers: [
        {
          provide: SeasonsService,
          useValue: mockSeasonsService,
        },
        {
          provide: getRepositoryToken(Season),
          useValue: {},
        },
        {
          provide: DataTransformationService,
          useValue: {},
        },
        {
          provide: DriversService,
          useValue: {},
        },
        {
          provide: ConstructorsService,
          useValue: {},
        },
        {
          provide: ErgastService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SeasonsController>(SeasonsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSeasonsChampions', () => {
    const mockSeasons = [
      {
        year: 2023,
        championDriver: {
          id: 1,
          driverId: 'max_verstappen',
          code: 'VER',
          firstName: 'Max',
          lastName: 'Verstappen',
          nationality: 'Dutch',
          dateOfBirth: '1997-09-30',
        },
        championConstructor: {
          id: 1,
          constructorId: 'red_bull',
          name: 'Red Bull',
          nationality: 'Austrian',
        },
      },
      {
        year: 2022,
        championDriver: {
          id: 1,
          driverId: 'max_verstappen',
          code: 'VER',
          firstName: 'Max',
          lastName: 'Verstappen',
          nationality: 'Dutch',
          dateOfBirth: '1997-09-30',
        },
        championConstructor: {
          id: 1,
          constructorId: 'red_bull',
          name: 'Red Bull',
          nationality: 'Austrian',
        },
      },
    ];

    it('should return seasons champions', async () => {
      mockSeasonsService.getSeasonsChampions.mockResolvedValue(mockSeasons);

      const result = await controller.getSeasonsChampions({
        fromYear: 2022,
        toYear: 2023,
      });

      expect(result).toEqual(mockSeasons);
      expect(mockSeasonsService.getSeasonsChampions).toHaveBeenCalledWith({
        fromYear: 2022,
        toYear: 2023,
      });
    });

    it('should handle empty results', async () => {
      mockSeasonsService.getSeasonsChampions.mockResolvedValue([]);

      const result = await controller.getSeasonsChampions({
        fromYear: 2022,
        toYear: 2023,
      });

      expect(result).toEqual([]);
      expect(mockSeasonsService.getSeasonsChampions).toHaveBeenCalledWith({
        fromYear: 2022,
        toYear: 2023,
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockSeasonsService.getSeasonsChampions.mockRejectedValue(error);

      await expect(
        controller.getSeasonsChampions({
          fromYear: 2022,
          toYear: 2023,
        }),
      ).rejects.toThrow('Service error');
    });
  });
});

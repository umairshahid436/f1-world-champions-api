import { Test, TestingModule } from '@nestjs/testing';
import { RacesService } from './races.service';
import { RacesRepository } from './repositories/races.repository';
import { ErgastService } from '@modules/external/ergast/ergast.service';
import { RaceDataTransformationService } from './services/data-transformation.service';
import { Race } from '@entities/race.entity';

describe('RacesService', () => {
  let service: RacesService;
  let racesRepository: jest.Mocked<RacesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        {
          provide: RacesRepository,
          useValue: {
            findBySeasonYear: jest.fn(),
            batchUpsertRaceData: jest.fn(),
          },
        },
        {
          provide: ErgastService,
          useValue: {
            fetchSeasonRaces: jest.fn(),
          },
        },
        {
          provide: RaceDataTransformationService,
          useValue: {
            transformErgastRaceDataToDbEntities: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);
    racesRepository = module.get(RacesRepository);
  });

  describe('getSeasonRaces', () => {
    it('should return data from database when it exists', async () => {
      // Arrange
      const year = 2023;
      const mockRaces = [] as Race[];

      racesRepository.findBySeasonYear.mockResolvedValue(mockRaces);

      // Act
      const result = await service.getSeasonRaces(year);

      // Assert
      expect(result).toEqual(mockRaces);
    });
  });
});

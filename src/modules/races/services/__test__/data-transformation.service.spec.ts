import { Test, TestingModule } from '@nestjs/testing';
import { RaceDataTransformationService } from '../data-transformation.service';
import { Race } from '../../../../database/entities/race.entity';
import { Driver } from '../../../../database/entities/driver.entity';
import { MOCK_ERGAST_RACES } from './mock-data';
import { ErgastRace } from '../../../external/ergast/ergast.interface';

describe('RaceDataTransformationService', () => {
  let service: RaceDataTransformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaceDataTransformationService],
    }).compile();

    service = module.get<RaceDataTransformationService>(
      RaceDataTransformationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformErgastRaceToDbEntities', () => {
    it('should correctly transform Ergast race data to database entities', () => {
      const result = service.transformErgastRaceToDbEntities(MOCK_ERGAST_RACES);

      expect(result.races).toHaveLength(2);
      expect(result.drivers).toHaveLength(1);

      expect(result.races[0]).toBeInstanceOf(Race);
      expect(result.races[1]).toBeInstanceOf(Race);
      expect(result.drivers[0]).toBeInstanceOf(Driver);
    });

    it('should link all races to the exact same driver instance for a unique driver', () => {
      const result = service.transformErgastRaceToDbEntities(MOCK_ERGAST_RACES);

      // Verify that the driver object in both races is the exact same instance
      expect(result.races[0].driver).toBe(result.races[1].driver);
      expect(result.races[0].driver).toBe(result.drivers[0]);
    });

    it('should handle races where time is not provided', () => {
      const raceWithoutTime: ErgastRace = {
        ...MOCK_ERGAST_RACES[0],
        time: undefined,
      };

      const result = service.transformErgastRaceToDbEntities([raceWithoutTime]);
      expect(result.races[0].time).toBe('');
    });

    it('should handle empty input gracefully', () => {
      const result = service.transformErgastRaceToDbEntities([]);
      expect(result.races).toHaveLength(0);
      expect(result.drivers).toHaveLength(0);
    });

    it('should handle race data where the winner is not present', () => {
      const raceWithNoWinner: ErgastRace = {
        ...MOCK_ERGAST_RACES[0],
        Results: [],
      };
      const result = service.transformErgastRaceToDbEntities([
        raceWithNoWinner,
      ]);
      expect(result.races).toHaveLength(0);
      expect(result.drivers).toHaveLength(0);
    });
  });
});

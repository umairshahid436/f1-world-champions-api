import { Test, TestingModule } from '@nestjs/testing';
import {
  DataTransformationService,
  TransformedSeasonData,
} from '../data-transformation.service';
import {
  ErgastDriverStanding,
  ErgastDriver,
  ErgastConstructor,
} from '../../../external/ergast/ergast.interface';
import { Season } from '../../../../database/entities/season.entity';
import { Driver } from '../../../../database/entities/driver.entity';
import { Constructor } from '../../../../database/entities/constructor.entity';
const mockDriver: ErgastDriver = {
  driverId: 'max_verstappen',
  permanentNumber: '1',
  code: 'VER',
  url: 'http://example.com/max',
  givenName: 'Max',
  familyName: 'Verstappen',
  nationality: 'Dutch',
};

const mockConstructor: ErgastConstructor = {
  constructorId: 'red_bull',
  url: 'http://example.com/redbull',
  name: 'Red Bull',
  nationality: 'Austrian',
};

const mockErgastData: ErgastDriverStanding[] = [
  {
    season: '2023',
    round: '1',
    position: '1',
    positionText: '1',
    points: '575',
    wins: '19',
    Driver: mockDriver,
    Constructors: [mockConstructor],
  },
  {
    season: '2022',
    round: '1',
    position: '1',
    positionText: '1',
    points: '454',
    wins: '15',
    Driver: mockDriver,
    Constructors: [mockConstructor],
  },
];
describe('DataTransformationService', () => {
  let service: DataTransformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataTransformationService],
    }).compile();

    service = module.get<DataTransformationService>(DataTransformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformSeasonsApiDataToEntities', () => {
    it('should transform Ergast data and ensure uniqueness', () => {
      const result = service.transformSeasonsApiDataToEntities(mockErgastData);

      expect(result).toHaveProperty('drivers');
      expect(result).toHaveProperty('constructors');
      expect(result).toHaveProperty('seasons');

      expect(result.drivers).toHaveLength(1);
      expect(result.constructors).toHaveLength(1);
      expect(result.seasons).toHaveLength(2);

      expect(result.drivers[0]).toBeInstanceOf(Driver);
      expect(result.constructors[0]).toBeInstanceOf(Constructor);
      expect(result.seasons[0]).toBeInstanceOf(Season);
    });
  });

  describe('extractUniqueDrivers', () => {
    it('should extract unique drivers and return Driver instances', () => {
      const result = service.extractUniqueDrivers(mockErgastData);
      const drivers = Array.from(result.values());

      expect(drivers).toHaveLength(1);
      expect(drivers[0]).toBeInstanceOf(Driver);
      expect(drivers[0].driverId).toBe(mockDriver.driverId);
    });
  });

  describe('extractUniqueConstructors', () => {
    it('should extract unique constructors and return Constructor instances', () => {
      const result = service.extractUniqueConstructors(mockErgastData);
      const constructors = Array.from(result.values());

      expect(constructors).toHaveLength(1);
      expect(constructors[0]).toBeInstanceOf(Constructor);
      expect(constructors[0].constructorId).toBe(mockConstructor.constructorId);
    });
  });

  describe('assembleSeasonsWithRelations', () => {
    it('should correctly attach driver and constructor entities to seasons', () => {
      const transformedData: TransformedSeasonData = {
        drivers: [new Driver(mockDriver)],
        constructors: [new Constructor(mockConstructor)],
        seasons: [
          new Season({
            year: 2023,
            points: '575',
            championDriverId: 'max_verstappen',
            championConstructorId: 'red_bull',
          }),
        ],
      };

      const result = service.assembleSeasonsWithRelations(
        transformedData.seasons,
        transformedData.drivers,
        transformedData.constructors,
      );

      expect(result).toHaveLength(1);
      const assembledSeason = result[0];
      expect(assembledSeason.championDriver).toBeInstanceOf(Driver);
      expect(assembledSeason.championConstructor).toBeInstanceOf(Constructor);
      expect(assembledSeason.championDriver.driverId).toBe('max_verstappen');
      expect(assembledSeason.championConstructor.constructorId).toBe(
        'red_bull',
      );
    });
  });
});

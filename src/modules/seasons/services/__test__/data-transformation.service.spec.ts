import { Test, TestingModule } from '@nestjs/testing';
import { DataTransformationService } from '../data-transformation.service';
import { ErgastDriverStanding } from '../../../external/ergast/ergast.interface';
import { Season } from '../../../../database/entities/season.entity';

describe('DataTransformationService', () => {
  let service: DataTransformationService;

  const mockErgastData: ErgastDriverStanding[] = [
    {
      season: '2023',
      round: '1',
      position: '1',
      positionText: '1',
      points: '454',
      wins: '19',
      Driver: {
        driverId: 'max_verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: 'http://example.com/max',
        givenName: 'Max',
        familyName: 'Verstappen',
        nationality: 'Dutch',
        dateOfBirth: '1997-09-30',
      },
      Constructors: [
        {
          constructorId: 'red_bull',
          url: 'http://example.com/redbull',
          name: 'Red Bull',
          nationality: 'Austrian',
        },
      ],
    },
    {
      season: '2022',
      round: '1',
      position: '1',
      positionText: '1',
      points: '454',
      wins: '15',
      Driver: {
        driverId: 'max_verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: 'http://example.com/max',
        givenName: 'Max',
        familyName: 'Verstappen',
        nationality: 'Dutch',
        dateOfBirth: '1997-09-30',
      },
      Constructors: [
        {
          constructorId: 'red_bull',
          url: 'http://example.com/redbull',
          name: 'Red Bull',
          nationality: 'Austrian',
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataTransformationService],
    }).compile();

    service = module.get<DataTransformationService>(DataTransformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformErgastDriverStandingsToEntities', () => {
    it('should transform Ergast data to database entities', () => {
      const result =
        service.transformErgastDriverStandingsToEntities(mockErgastData);

      expect(result).toHaveProperty('drivers');
      expect(result).toHaveProperty('constructors');
      expect(result).toHaveProperty('seasons');

      expect(result.drivers).toHaveLength(1);
      expect(result.constructors).toHaveLength(1);
      expect(result.seasons).toHaveLength(2);
    });
  });

  describe('extractUniqueDrivers', () => {
    it('should extract unique drivers from Ergast data', () => {
      const result = service.extractUniqueDrivers(mockErgastData);
      const drivers = Array.from(result.values());

      expect(drivers).toHaveLength(1);
      expect(drivers[0]).toEqual({
        driverId: 'max_verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: 'http://example.com/max',
        givenName: 'Max',
        familyName: 'Verstappen',
        nationality: 'Dutch',
        dateOfBirth: '1997-09-30',
      });
    });

    it('should handle drivers without permanent number', () => {
      const dataWithoutPermanentNumber = [
        {
          ...mockErgastData[0],
          Driver: {
            ...mockErgastData[0].Driver,
            permanentNumber: undefined,
          },
        },
      ];

      const result = service.extractUniqueDrivers(dataWithoutPermanentNumber);
      const drivers = Array.from(result.values());

      expect(drivers[0].permanentNumber).toBeUndefined();
    });
  });

  describe('extractUniqueConstructors', () => {
    it('should extract unique constructors from Ergast data', () => {
      const result = service.extractUniqueConstructors(mockErgastData);
      const constructors = Array.from(result.values());

      expect(constructors).toHaveLength(1);
      expect(constructors[0]).toEqual({
        constructorId: 'red_bull',
        name: 'Red Bull',
        nationality: 'Austrian',
        url: 'http://example.com/redbull',
      });
    });
  });

  describe('transformSeasons', () => {
    it('should transform Ergast data to Season entities', () => {
      const result = service['transformSeasons'](mockErgastData);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Season);
      expect(result[0]).toEqual(
        expect.objectContaining({
          year: 2023,
          points: '454',
          championDriverId: 'max_verstappen',
          championConstructorId: 'red_bull',
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          year: 2022,
          points: '454',
          championDriverId: 'max_verstappen',
          championConstructorId: 'red_bull',
        }),
      );
    });
  });
});

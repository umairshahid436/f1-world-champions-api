import { Test, TestingModule } from '@nestjs/testing';
import { RaceDataTransformationService } from '../data-transformation.service';
import { ErgastRace } from '../../../external/ergast/ergast.interface';
import { Race } from '../../../../database/entities/race.entity';
import { Driver } from '../../../../database/entities/driver.entity';

describe('RaceDataTransformationService', () => {
  let service: RaceDataTransformationService;

  const mockErgastRaces: ErgastRace[] = [
    {
      season: '2023',
      round: '1',
      url: 'http://example.com/race1',
      raceName: 'Bahrain Grand Prix',
      Circuit: {
        circuitId: 'bahrain',
        url: 'http://example.com/circuit1',
        circuitName: 'Bahrain International Circuit',
        Location: {
          lat: '26.0325',
          long: '50.5106',
          locality: 'Sakhir',
          country: 'Bahrain',
        },
      },
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
            permanentNumber: '1',
            code: 'VER',
            url: 'http://example.com/max',
            givenName: 'Max',
            familyName: 'Verstappen',
            nationality: 'Dutch',
            dateOfBirth: '1997-09-30',
          },
          Constructor: {
            constructorId: 'red_bull',
            url: 'http://example.com/redbull',
            name: 'Red Bull',
            nationality: 'Austrian',
          },
          grid: '1',
          laps: '57',
          status: 'Finished',
          Time: {
            millis: '5633606',
            time: '1:33:56.736',
          },
          FastestLap: {
            rank: '1',
            lap: '44',
            Time: {
              time: '1:33.996',
            },
            AverageSpeed: {
              units: 'kph',
              speed: '206.018',
            },
          },
        },
      ],
    },
    {
      season: '2023',
      round: '2',
      url: 'http://example.com/race2',
      raceName: 'Saudi Arabian Grand Prix',
      Circuit: {
        circuitId: 'jeddah',
        url: 'http://example.com/circuit2',
        circuitName: 'Jeddah Corniche Circuit',
        Location: {
          lat: '21.5433',
          long: '39.1728',
          locality: 'Jeddah',
          country: 'Saudi Arabia',
        },
      },
      date: '2023-03-19',
      time: '17:00:00Z',
      Results: [
        {
          number: '1',
          position: '1',
          positionText: '1',
          points: '25',
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
          Constructor: {
            constructorId: 'red_bull',
            url: 'http://example.com/redbull',
            name: 'Red Bull',
            nationality: 'Austrian',
          },
          grid: '1',
          laps: '50',
          status: 'Finished',
          Time: {
            millis: '5033606',
            time: '1:23:56.736',
          },
          FastestLap: {
            rank: '1',
            lap: '38',
            Time: {
              time: '1:31.996',
            },
            AverageSpeed: {
              units: 'kph',
              speed: '208.018',
            },
          },
        },
      ],
    },
  ];

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
    it('should transform Ergast race data to database entities', () => {
      const result = service.transformErgastRaceToDbEntities(mockErgastRaces);

      expect(result).toHaveProperty('drivers');
      expect(result).toHaveProperty('races');

      // Check drivers
      expect(result.drivers).toHaveLength(1); // Same driver won both races
      expect(result.drivers[0]).toBeInstanceOf(Driver);
      expect(result.drivers[0]).toEqual(
        expect.objectContaining({
          driverId: 'max_verstappen',
          permanentNumber: '1',
          code: 'VER',
          givenName: 'Max',
          familyName: 'Verstappen',
          nationality: 'Dutch',
        }),
      );

      // Check races
      expect(result.races).toHaveLength(2);
      expect(result.races[0]).toBeInstanceOf(Race);
      expect(result.races[0]).toEqual(
        expect.objectContaining({
          seasonYear: 2023,
          points: '25',
          name: 'Bahrain Grand Prix',
          date: '2023-03-05',
          time: '15:00:00Z',
          circuitName: 'Bahrain International Circuit',
          driverId: 'max_verstappen',
        }),
      );
      expect(result.races[1]).toEqual(
        expect.objectContaining({
          seasonYear: 2023,
          points: '25',
          name: 'Saudi Arabian Grand Prix',
          date: '2023-03-19',
          time: '17:00:00Z',
          circuitName: 'Jeddah Corniche Circuit',
          driverId: 'max_verstappen',
        }),
      );
    });

    it('should handle races without time', () => {
      const raceWithoutTime = {
        ...mockErgastRaces[0],
        time: undefined,
      };

      const result = service.transformErgastRaceToDbEntities([raceWithoutTime]);

      expect(result.races[0].time).toBe('');
    });
  });
});

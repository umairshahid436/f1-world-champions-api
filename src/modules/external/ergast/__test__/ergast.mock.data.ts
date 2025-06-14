import type {
  ErgastDriverStandingsResponse,
  ErgastRaceResultsResponse,
} from '../ergast.interface';

export const mockDriverStandings2023: ErgastDriverStandingsResponse = {
  MRData: {
    xmlns: '',
    series: '',
    url: '',
    limit: '',
    offset: '',
    total: '',
    StandingsTable: {
      season: '2023',
      round: '',
      StandingsLists: [
        {
          season: '2023',
          round: '22',
          DriverStandings: [
            {
              season: '2023',
              round: '22',
              position: '1',
              positionText: '1',
              points: '575',
              wins: '19',
              Driver: {
                driverId: 'max_verstappen',
                permanentNumber: '33',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_verstappen',
                givenName: 'Max',
                familyName: 'Verstappen',
                dateOfBirth: '1997-09-30',
                nationality: 'Dutch',
              },
              Constructors: [
                {
                  constructorId: 'red_bull',
                  url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
                  name: 'Red Bull',
                  nationality: 'Austrian',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

export const mockDriverStandings2024: ErgastDriverStandingsResponse = {
  MRData: {
    xmlns: '',
    series: '',
    url: '',
    limit: '',
    offset: '',
    total: '',
    StandingsTable: {
      season: '2024',
      round: '',
      StandingsLists: [
        {
          season: '2024',
          round: '20',
          DriverStandings: [
            {
              season: '2024',
              round: '20',
              position: '1',
              positionText: '1',
              points: '575',
              wins: '19',
              Driver: {
                driverId: 'max_verstappen',
                permanentNumber: '33',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_verstappen',
                givenName: 'Max',
                familyName: 'Verstappen',
                dateOfBirth: '1997-09-30',
                nationality: 'Dutch',
              },
              Constructors: [
                {
                  constructorId: 'red_bull',
                  url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
                  name: 'Red Bull',
                  nationality: 'Austrian',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

export const mockRaceResults2023: ErgastRaceResultsResponse = {
  MRData: {
    xmlns: '',
    series: '',
    url: '',
    limit: '',
    offset: '',
    total: '',
    RaceTable: {
      season: '2023',
      Races: [
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
                permanentNumber: '33',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_verstappen',
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
              grid: '1',
              laps: '57',
              status: 'Finished',
              Time: {
                millis: '5636736',
                time: '1:33:56.736',
              },
              FastestLap: {
                rank: '2',
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
            {
              number: '11',
              position: '2',
              positionText: '2',
              points: '18',
              Driver: {
                driverId: 'perez',
                permanentNumber: '11',
                code: 'PER',
                url: 'http://en.wikipedia.org/wiki/Sergio_P%C3%A9rez',
                givenName: 'Sergio',
                familyName: 'Pérez',
                dateOfBirth: '1990-01-26',
                nationality: 'Mexican',
              },
              Constructor: {
                constructorId: 'red_bull',
                url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
                name: 'Red Bull',
                nationality: 'Austrian',
              },
              grid: '2',
              laps: '57',
              status: 'Finished',
              Time: {
                millis: '5641996',
                time: '+52.260',
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
      ],
    },
  },
};

export const mockRaceResults2024: ErgastRaceResultsResponse = {
  MRData: {
    xmlns: '',
    series: '',
    url: '',
    limit: '',
    offset: '',
    total: '',
    RaceTable: {
      season: '2024',
      Races: [
        {
          season: '2024',
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
                permanentNumber: '33',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_verstappen',
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
              grid: '1',
              laps: '57',
              status: 'Finished',
              Time: {
                millis: '5636736',
                time: '1:33:56.736',
              },
              FastestLap: {
                rank: '2',
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
            {
              number: '2',
              position: '2',
              positionText: '2',
              points: '25',
              Driver: {
                driverId: 'max_verstappen',
                permanentNumber: '33',
                code: 'VER',
                url: 'http://en.wikipedia.org/wiki/Max_verstappen',
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
              grid: '1',
              laps: '57',
              status: 'Finished',
              Time: {
                millis: '5636736',
                time: '1:33:56.736',
              },
              FastestLap: {
                rank: '2',
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
      ],
    },
  },
};

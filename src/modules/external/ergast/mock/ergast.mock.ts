import {
  ErgastDriver,
  ErgastConstructor,
  ErgastDriverStanding,
  ErgastStandingList,
  ErgastDriverStandingsResponse,
  ErgastRace,
  ErgastRaceResultsResponse,
} from '../ergast.interface';

export const mockDriver: ErgastDriver = {
  driverId: 'max_verstappen',
  permanentNumber: '33',
  code: 'VER',
  url: 'http://example.com',
  givenName: 'Max',
  familyName: 'Verstappen',
  dateOfBirth: '1997-09-30',
  nationality: 'Dutch',
};

export const mockConstructor: ErgastConstructor = {
  constructorId: 'red_bull',
  url: 'http://example.com',
  name: 'Red Bull',
  nationality: 'Austrian',
};

export const mockDriverStanding: ErgastDriverStanding = {
  position: '1',
  points: '100',
  Driver: mockDriver,
  Constructors: [mockConstructor],
  season: '2023',
  round: '22',
  positionText: '1',
  wins: '10',
};

export const mockStandingList: ErgastStandingList = {
  season: '2023',
  round: '22',
  DriverStandings: [mockDriverStanding],
};

export const mockDriverStandings: ErgastDriverStandingsResponse = {
  MRData: {
    xmlns: 'http://ergast.com/mrd/1.5',
    series: 'f1',
    url: 'http://ergast.com/api/f1/2023/driverStandings.json',
    limit: '30',
    offset: '0',
    total: '1',
    StandingsTable: {
      season: '2023',
      round: '22',
      StandingsLists: [mockStandingList],
    },
  },
};

export const mockRace: ErgastRace = {
  season: '2023',
  round: '1',
  url: 'http://example.com',
  raceName: 'Bahrain Grand Prix',
  Circuit: {
    circuitId: 'bahrain',
    url: 'http://example.com',
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
      Driver: mockDriver,
      Constructor: mockConstructor,
      grid: '1',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5637366', time: '1:33:56.736' },
      FastestLap: {
        rank: '1',
        lap: '44',
        Time: { time: '1:33.996' },
        AverageSpeed: { units: 'kph', speed: '206.374' },
      },
    },
  ],
};

export const mockRaceResults: ErgastRaceResultsResponse = {
  MRData: {
    xmlns: 'http://ergast.com/mrd/1.5',
    series: 'f1',
    url: 'http://ergast.com/api/f1/2023/results.json',
    limit: '30',
    offset: '0',
    total: '1',
    RaceTable: {
      season: '2023',
      Races: [mockRace],
    },
  },
};

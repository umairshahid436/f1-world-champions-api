export interface ErgastDriver {
  driverId: string;
  permanentNumber?: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth?: string;
}

export interface ErgastConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface ErgastCircuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface ErgastStandingList {
  season: string;
  round: string;
  DriverStandings: ErgastDriverStanding[];
}

export interface ErgastDriverStandingsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: ErgastStandingList[];
    };
  };
}

export interface ErgastDriverStanding {
  season: string;
  round: string;
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
}

export interface ErgastRaceResultsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      Races: ErgastRace[];
    };
  };
}

export interface ErgastRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: ErgastCircuit;
  date: string;
  time?: string;
  Results: ErgastRaceResult[];
}

export interface ErgastRaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      units: string;
      speed: string;
    };
  };
}

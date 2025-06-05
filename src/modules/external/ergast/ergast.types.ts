export interface ErgastDriverStanding {
  season: string;
  round: string;
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  }>;
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
      StandingsLists: Array<{
        season: string;
        round: string;
        DriverStandings: ErgastDriverStanding[];
      }>;
    };
  };
}

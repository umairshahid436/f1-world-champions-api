import { ErgastEndpoints } from './ergast.endpoints';

describe('ErgastEndpoints', () => {
  describe('results', () => {
    it('should return correct URL for race results', () => {
      const year = 2023;
      const expectedUrl = 'https://api.jolpi.ca/ergast/f1/2023/results.json';
      const result = ErgastEndpoints.results(year);
      expect(result).toBe(expectedUrl);
    });

    it('should handle different years', () => {
      const years = [2020, 2021, 2022, 2023];
      years.forEach((year) => {
        const result = ErgastEndpoints.results(year);
        expect(result).toBe(
          `https://api.jolpi.ca/ergast/f1/${year}/results.json`,
        );
      });
    });
  });

  describe('driverStandings', () => {
    it('should return correct URL for driver standings', () => {
      const year = 2023;
      const expectedUrl =
        'https://api.jolpi.ca/ergast/f1/2023/driverStandings.json';
      const result = ErgastEndpoints.driverStandings(year);
      expect(result).toBe(expectedUrl);
    });

    it('should handle different years', () => {
      const years = [2020, 2021, 2022, 2023];
      years.forEach((year) => {
        const result = ErgastEndpoints.driverStandings(year);
        expect(result).toBe(
          `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`,
        );
      });
    });
  });
});

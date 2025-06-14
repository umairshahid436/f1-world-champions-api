import { ErgastEndpoints } from '../ergast.endpoints';

describe('ErgastEndpoints', () => {
  describe('results', () => {
    it('should return correct URL for a given year', () => {
      const year = 2023;
      const url = ErgastEndpoints.results({ year });
      expect(url).toBe(`${ErgastEndpoints.baseUrl}/2023/results.json`);
    });

    it('should include limit parameter when provided', () => {
      const year = 2023;
      const limit = 100;
      const url = ErgastEndpoints.results({ year, limit });
      expect(url).toBe(
        `${ErgastEndpoints.baseUrl}/2023/results.json?limit=100`,
      );
    });

    it('should include both limit and offset parameters when provided', () => {
      const year = 2023;
      const limit = 100;
      const offset = 200;
      const url = ErgastEndpoints.results({ year, limit, offset });
      expect(url).toBe(
        `${ErgastEndpoints.baseUrl}/${year}/results.json?limit=${limit}&offset=${offset}`,
      );
    });

    it('should not include offset parameter when only limit is provided', () => {
      const year = 2023;
      const limit = 100;
      const url = ErgastEndpoints.results({ year, limit });
      expect(url).not.toContain('offset=');
    });
  });

  describe('driverStandings', () => {
    it('should return correct URL for driver standings', () => {
      const year = 2023;
      const expectedUrl = `${ErgastEndpoints.baseUrl}/${year}/driverStandings.json`;
      const result = ErgastEndpoints.driverStandings(year);
      expect(result).toBe(expectedUrl);
    });

    it('should handle different years', () => {
      const years = [2020, 2021, 2022, 2023];
      years.forEach((year) => {
        const result = ErgastEndpoints.driverStandings(year);
        expect(result).toBe(
          `${ErgastEndpoints.baseUrl}/${year}/driverStandings.json`,
        );
      });
    });
  });
});

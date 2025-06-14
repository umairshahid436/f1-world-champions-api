export class ErgastEndpoints {
  static readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  /* Get race results for a specific year */
  static results({
    year,
    limit,
    offset,
  }: {
    year: number;
    limit?: number;
    offset?: number;
  }): string {
    let url = `${this.baseUrl}/${year}/results.json`;
    if (limit) {
      url += `?limit=${limit}`;
      if (offset) {
        url += `&offset=${offset}`;
      }
    }
    return url;
  }

  /* Get driver standings for a specific year */
  static driverStandings(year: number): string {
    return `${this.baseUrl}/${year}/driverStandings.json`;
  }
}

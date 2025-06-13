export class ErgastEndpoints {
  private static readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  /* Get race results for a specific year */
  static results(year: number): string {
    return `${this.baseUrl}/${year}/results.json`;
  }

  /* Get driver standings for a specific year */
  static driverStandings(year: number): string {
    return `${this.baseUrl}/${year}/driverStandings.json`;
  }
}

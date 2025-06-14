import { Injectable } from '@nestjs/common';
import { Race } from '../../../database/entities/race.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { ErgastRace } from '../../external/ergast/ergast.interface';

export interface RaceTransformationResult {
  drivers: Driver[];
  races: Race[];
}

@Injectable()
export class RaceDataTransformationService {
  /* Transform Ergast API race data to database entities */
  transformErgastRaceToDbEntities(
    ergastRaces: ErgastRace[],
  ): RaceTransformationResult {
    const driversMap = this.extractUniqueDrivers(ergastRaces);
    const races: Race[] = [];

    for (const ergastRace of ergastRaces) {
      const winner = ergastRace.Results[0];

      // If there is no winner data for the race, skip it.
      if (!winner) {
        continue;
      }

      const driver = driversMap.get(winner.Driver.driverId);
      // This should not happen with valid API data
      if (!driver) continue;

      const race = new Race({
        seasonYear: parseInt(ergastRace.season),
        points: winner.points,
        name: ergastRace.raceName,
        date: ergastRace.date,
        time: ergastRace.time || '',
        circuitName: ergastRace.Circuit.circuitName,
        driverId: winner.Driver.driverId,
        driver: driver,
      });
      races.push(race);
    }

    return {
      drivers: Array.from(driversMap.values()),
      races,
    };
  }

  extractUniqueDrivers(ergastRaces: ErgastRace[]): Map<string, Driver> {
    const driversMap = new Map<string, Driver>();
    for (const ergastRace of ergastRaces) {
      const winner = ergastRace.Results[0];
      if (winner && !driversMap.has(winner.Driver.driverId)) {
        driversMap.set(
          winner.Driver.driverId,
          new Driver({
            ...winner.Driver,
            permanentNumber: winner.Driver.permanentNumber || '',
          }),
        );
      }
    }
    return driversMap;
  }
}

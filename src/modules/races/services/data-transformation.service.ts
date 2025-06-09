import { Injectable } from '@nestjs/common';
import { Race } from '@entities/race.entity';
import { Driver } from '@entities/driver.entity';
import { ErgastRace } from '@modules/external/ergast/ergast.interface';

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
    const driversMap = new Map<string, Driver>();
    const races: Race[] = [];

    for (const ergastRace of ergastRaces) {
      const winner = ergastRace.Results[0];
      const driver: Driver = {
        ...winner.Driver,
        permanentNumber: winner.Driver.permanentNumber || '',
        createdAt: new Date(),
      } as Driver;
      if (!driversMap.has(driver.driverId)) {
        driversMap.set(driver.driverId, driver);
      }
      const race = {
        seasonYear: parseInt(ergastRace.season),
        points: winner.points,
        name: ergastRace.raceName,
        date: ergastRace.date,
        time: ergastRace.time || '',
        circuitName: ergastRace.Circuit.circuitName,
        driverId: winner.Driver.driverId,
      } as Race;
      races.push(race);
    }

    return {
      drivers: Array.from(driversMap.values()),
      races,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ErgastDriverStanding } from '../../external/ergast/ergast.interface';
import { Driver } from '../../../database/entities/driver.entity';
import { Constructor } from '../../../database/entities/constructor.entity';
import { Season } from '../../../database/entities/season.entity';

export interface TransformedData {
  drivers: Partial<Driver>[];
  constructors: Partial<Constructor>[];
  seasons: Season[];
}

@Injectable()
export class DataTransformationService {
  private readonly logger = new Logger(DataTransformationService.name);

  /**
   * Transform Ergast API data to database entities
   */
  transformErgastDriverStandingsToEntities(
    ergastData: ErgastDriverStanding[],
  ): TransformedData {
    const uniqueDriversMap = this.extractUniqueDrivers(ergastData);
    const drivers = Array.from(uniqueDriversMap.values());

    const uniqueConstructorsMap = this.extractUniqueConstructors(ergastData);
    const constructors = Array.from(uniqueConstructorsMap.values());

    const seasons = this.transformSeasons(ergastData);

    return {
      drivers,
      constructors,
      seasons,
    };
  }

  extractUniqueDrivers(ergastData: ErgastDriverStanding[]) {
    const driversMap = new Map<string, Partial<Driver>>();

    for (const standing of ergastData) {
      const { Driver: driverData } = standing;

      if (!driversMap.has(driverData.driverId)) {
        driversMap.set(driverData.driverId, {
          ...driverData,
          permanentNumber: driverData.permanentNumber
            ? driverData.permanentNumber
            : undefined,
        });
      }
    }

    return driversMap;
  }

  extractUniqueConstructors(ergastData: ErgastDriverStanding[]) {
    const constructorsMap = new Map<string, Partial<Constructor>>();

    for (const standing of ergastData) {
      for (const constructorData of standing.Constructors) {
        if (!constructorsMap.has(constructorData.constructorId)) {
          constructorsMap.set(constructorData.constructorId, {
            constructorId: constructorData.constructorId,
            name: constructorData.name,
            nationality: constructorData.nationality,
            url: constructorData.url,
          });
        }
      }
    }

    return constructorsMap;
  }

  private transformSeasons(ergastData: ErgastDriverStanding[]): Season[] {
    return ergastData.map(
      (standing) =>
        new Season({
          year: parseInt(standing.season),
          points: standing.points,
          championDriverId: standing.Driver.driverId,
          championDriver: standing.Driver as Driver,
          championConstructor: standing.Constructors[0] as Constructor,
          championConstructorId: standing.Constructors[0]?.constructorId || '',
        }),
    );
  }
}

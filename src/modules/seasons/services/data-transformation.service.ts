import { Injectable, Logger } from '@nestjs/common';
import { ErgastDriverStanding } from '@modules/external/ergast/ergast.interface';
import { Driver } from '@entities/driver.entity';
import { Constructor } from '@entities/constructor.entity';
import { Season } from '@entities/season.entity';

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
  transformErgastApiDataToDbEntities(
    ergastData: ErgastDriverStanding[],
  ): TransformedData {
    try {
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
    } catch (error) {
      this.logger.error('Failed to transform Ergast data:', error);
      throw new Error(
        `Data transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private extractUniqueDrivers(
    ergastData: ErgastDriverStanding[],
  ): Map<string, Partial<Driver>> {
    const driversMap = new Map<string, Partial<Driver>>();

    for (const standing of ergastData) {
      const { Driver: driverData } = standing;

      if (!driversMap.has(driverData.driverId)) {
        driversMap.set(driverData.driverId, {
          id: driverData.driverId,
          given_name: driverData.givenName,
          family_name: driverData.familyName,
          nationality: driverData.nationality,
          permanent_number: driverData.permanentNumber
            ? driverData.permanentNumber
            : undefined,
          code: driverData.code,
          url: driverData.url,
        });
      }
    }

    return driversMap;
  }

  private extractUniqueConstructors(
    ergastData: ErgastDriverStanding[],
  ): Map<string, Partial<Constructor>> {
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
          round: standing.round,
          position: standing.position,
          positionText: standing.position,
          points: standing.points,
          wins: standing.wins,
          champion_driver_id: standing.Driver.driverId,
          champion_constructor_id:
            standing.Constructors[0]?.constructorId || '',
        }),
    );
  }
}

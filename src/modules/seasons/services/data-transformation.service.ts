import { Injectable, Logger } from '@nestjs/common';
import { ErgastDriverStanding } from '../../external/ergast/ergast.interface';
import { Driver } from '../../../database/entities/driver.entity';
import { Constructor } from '../../../database/entities/constructor.entity';
import { Season } from '../../../database/entities/season.entity';

export interface TransformedSeasonData {
  drivers: Driver[];
  constructors: Constructor[];
  seasons: Season[];
}

@Injectable()
export class DataTransformationService {
  private readonly logger = new Logger(DataTransformationService.name);

  /**
   * Transform Ergast API data to database entities
   */
  transformSeasonsApiDataToEntities(
    ergastData: ErgastDriverStanding[],
  ): TransformedSeasonData {
    const uniqueDriversMap = this.extractUniqueDrivers(ergastData);
    const drivers = Array.from(uniqueDriversMap.values());

    const uniqueConstructorsMap = this.extractUniqueConstructors(ergastData);
    const constructors = Array.from(uniqueConstructorsMap.values());

    const seasons = this.transformSeasons(
      ergastData,
      uniqueDriversMap,
      uniqueConstructorsMap,
    );

    return {
      drivers,
      constructors,
      seasons,
    };
  }

  extractUniqueDrivers(ergastData: ErgastDriverStanding[]) {
    const driversMap = new Map<string, Driver>();

    for (const standing of ergastData) {
      const { Driver: driverData } = standing;

      if (!driversMap.has(driverData.driverId)) {
        driversMap.set(driverData.driverId, new Driver(driverData));
      }
    }

    return driversMap;
  }

  extractUniqueConstructors(ergastData: ErgastDriverStanding[]) {
    const constructorsMap = new Map<string, Constructor>();

    for (const standing of ergastData) {
      for (const constructorData of standing.Constructors) {
        if (!constructorsMap.has(constructorData.constructorId)) {
          constructorsMap.set(
            constructorData.constructorId,
            new Constructor(constructorData),
          );
        }
      }
    }

    return constructorsMap;
  }

  assembleSeasonsWithRelations(
    seasons: Season[],
    drivers: Driver[],
    constructors: Constructor[],
  ): Season[] {
    const driverMap = new Map(drivers.map((d) => [d.driverId, d]));
    const constructorMap = new Map(
      constructors.map((c) => [c.constructorId, c]),
    );

    return seasons.map((season) => {
      const championDriver = driverMap.get(season.championDriverId);
      const championConstructor = constructorMap.get(
        season.championConstructorId,
      );

      if (!championDriver || !championConstructor) {
        this.logger.warn(
          `Could not find matching driver or constructor for season ${season.year}`,
        );
        return season;
      }

      return {
        ...season,
        championDriver,
        championConstructor,
      };
    });
  }

  private transformSeasons(
    ergastData: ErgastDriverStanding[],
    driversMap: Map<string, Driver>,
    constructorsMap: Map<string, Constructor>,
  ): Season[] {
    return ergastData.map((standing) => {
      const championDriver = driversMap.get(standing.Driver.driverId);
      const championConstructor = constructorsMap.get(
        standing.Constructors[0]?.constructorId,
      );

      return new Season({
        year: parseInt(standing.season),
        points: standing.points,
        championDriverId: standing.Driver.driverId,
        championConstructorId: standing.Constructors[0]?.constructorId,
        championDriver,
        championConstructor,
      });
    });
  }
}

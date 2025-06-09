import { Race } from '@entities/race.entity';
import { Expose, Transform, Type } from 'class-transformer';

class WinnerDriverDto {
  @Expose()
  driverId!: string;

  @Expose()
  name!: string;
}

export class RaceDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  circuitName!: string;

  @Expose()
  date!: string;

  @Expose()
  time!: Date;

  @Expose()
  @Type(() => WinnerDriverDto)
  @Transform(({ obj }: { obj: Race }) => {
    return {
      driverId: obj.driver.driverId,
      name: `${obj.driver.givenName} ${obj.driver.familyName}`,
    };
  })
  winnerDriver!: WinnerDriverDto;
}

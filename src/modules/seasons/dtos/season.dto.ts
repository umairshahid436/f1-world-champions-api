import { Expose, Transform, Type } from 'class-transformer';
import { Season } from '../../../database/entities/season.entity';

export class ChampionDriverDto {
  @Expose()
  driverId!: string;

  @Expose()
  name!: string;
}
export class ChampionConstructorDto {
  @Expose()
  constructorId!: string;

  @Expose()
  name!: string;
}

export class SeasonDto {
  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.year.toString())
  season!: string;

  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.points)
  points!: string;

  @Expose()
  @Type(() => ChampionDriverDto)
  @Transform(({ obj }: { obj: Season }) => ({
    driverId: obj.championDriver.driverId,
    name: `${obj.championDriver.givenName} ${obj.championDriver.familyName}`,
  }))
  championDriver!: ChampionDriverDto;

  @Expose()
  @Type(() => ChampionConstructorDto)
  @Transform(({ obj }: { obj: Season }) => ({
    constructorId: obj.championConstructor.constructorId,
    name: obj.championConstructor.name,
  }))
  championConstructor!: ChampionConstructorDto;
}

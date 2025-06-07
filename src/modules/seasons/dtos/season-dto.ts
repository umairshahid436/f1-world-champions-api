import { Expose, Transform, Type } from 'class-transformer';
import { Season } from '@entities/season.entity';

export class ChampionDto {
  @Expose()
  id!: string;

  @Expose()
  permanentNumber?: string;

  @Expose()
  code!: string;

  @Expose()
  url!: string;

  @Expose()
  name!: string;
}
export class ConstructorDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
  @Expose()
  nationality!: string;
  @Expose()
  url!: string;
}

export class SeasonDto {
  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.year.toString())
  season!: string;

  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.round)
  round!: string;

  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.position)
  position!: string;

  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.points)
  points!: string;

  @Expose()
  @Transform(({ obj }: { obj: Season }) => obj.wins)
  wins!: string;

  @Expose()
  @Type(() => ChampionDto)
  @Transform(({ obj }: { obj: Season }) => ({
    id: obj.champion_driver.id,
    permanentNumber: obj.champion_driver.permanent_number,
    code: obj.champion_driver.code,
    url: obj.champion_driver.url,
    name: `${obj.champion_driver.given_name} ${obj.champion_driver.family_name}`,
  }))
  championDriver!: ChampionDto;

  @Expose()
  @Type(() => ConstructorDto)
  @Transform(({ obj }: { obj: Season }) => ({
    id: obj.champion_constructor.constructorId,
    url: obj.champion_constructor.url,
    name: obj.champion_constructor.name,
    nationality: obj.champion_constructor.nationality,
  }))
  championConstructor!: ConstructorDto;
}

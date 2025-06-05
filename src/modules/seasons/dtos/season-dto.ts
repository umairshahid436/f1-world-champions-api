import { Expose } from 'class-transformer';

export class SeasonDto {
  @Expose()
  year!: number;
}

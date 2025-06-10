import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SeasonQueryDto {
  @IsNotEmpty({ message: 'fromYear is required' })
  @Type(() => Number)
  @IsInt({ message: 'fromYear must be an integer' })
  @Min(1950, {
    message: 'fromYear cannot be before 1950',
  })
  @Max(new Date().getFullYear(), {
    message: 'fromYear cannot be in the future',
  })
  fromYear!: number;

  @IsNotEmpty({ message: 'toYear is required' })
  @Type(() => Number)
  @IsInt({ message: 'toYear must be an integer' })
  @Min(1950, {
    message: 'toYear cannot be before 1950 (F1 started in 1950)',
  })
  @Max(new Date().getFullYear(), {
    message: 'toYear cannot be in the future',
  })
  toYear!: number;
}

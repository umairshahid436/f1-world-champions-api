import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SeasonQueryDto {
  @ApiProperty({
    description: 'The year to start from',
    example: 2020,
    minimum: 2005,
    maximum: 2024,
    type: Number,
  })
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

  @ApiProperty({
    description: 'The year to end to',
    example: 2025,
    minimum: 2006,
    maximum: new Date().getFullYear(),
    type: Number,
  })
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

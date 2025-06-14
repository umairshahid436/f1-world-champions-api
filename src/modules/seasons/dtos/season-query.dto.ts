import { IsInt, IsNotEmpty, Min, Max, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SortBy } from '../../../interfaces/api.interface';

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear();
const SORT_ORDER_VALUES: SortBy[] = ['ASC', 'DESC'];
export class SeasonQueryDto {
  @ApiProperty({
    description: 'The year to start from',
    example: 2020,
    minimum: MIN_YEAR,
    maximum: MAX_YEAR,
    type: Number,
  })
  @IsNotEmpty({ message: 'fromYear is required' })
  @Type(() => Number)
  @IsInt({ message: 'fromYear must be an integer' })
  @Min(MIN_YEAR, {
    message: `fromYear cannot be before ${MIN_YEAR}`,
  })
  @Max(MAX_YEAR, {
    message: 'fromYear cannot be in the future',
  })
  fromYear!: number;

  @ApiProperty({
    description: 'The year to end to',
    example: 2010,
    minimum: MIN_YEAR,
    maximum: MAX_YEAR,
    type: Number,
  })
  @IsNotEmpty({ message: 'toYear is required' })
  @Type(() => Number)
  @IsInt({ message: 'toYear must be an integer' })
  @Min(MIN_YEAR, {
    message: `toYear cannot be before ${MIN_YEAR}`,
  })
  @Max(MAX_YEAR, {
    message: 'toYear cannot be in the future',
  })
  toYear!: number;

  @ApiProperty({
    description: 'Sort order (by year)',
    example: 'DESC',
    enum: SORT_ORDER_VALUES,
    required: false,
  })
  @IsOptional()
  @IsIn(SORT_ORDER_VALUES)
  sortOrder?: SortBy;
}

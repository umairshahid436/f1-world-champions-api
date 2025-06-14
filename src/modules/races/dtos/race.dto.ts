import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WinnerDriverDto {
  @ApiProperty({ description: "The driver's unique ID" })
  @Expose()
  driverId!: string;

  @ApiProperty({ description: "The driver's full name" })
  @Expose()
  name!: string;

  @ApiProperty({
    description: "Indicates if the race winner was also the season's champion",
  })
  @Expose()
  isChampion!: boolean;
}

export class RaceDto {
  @ApiProperty({ description: 'The unique ID of the race' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'The name of the race' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'The name of the circuit' })
  @Expose()
  circuitName!: string;

  @ApiProperty({ description: 'The date of the race' })
  @Expose()
  date!: string;

  @ApiProperty({ description: 'The time of the race' })
  @Expose()
  time!: string;

  @ApiProperty({
    description: 'The driver who won the race',
    type: () => WinnerDriverDto,
  })
  @Expose()
  @Type(() => WinnerDriverDto)
  winnerDriver!: WinnerDriverDto;
}

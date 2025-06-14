import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './services/races.service';
import { Serialize } from '../../decorators/serialize.decorator';
import { RaceDto } from './dtos/race.dto';
import { ApiParam, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('season/:year/races')
@ApiTags('Races')
@Serialize(RaceDto)
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get season races',
    description: 'Retrieve all races and winners for a specific season',
  })
  @ApiParam({
    name: 'year',
    description: 'The year of the season',
    example: 2023,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      'List of races with winner information for the specified season',
  })
  getSeasonRaces(@Param('year', ParseIntPipe) year: number) {
    return this.racesService.getSeasonRaces(year);
  }
}

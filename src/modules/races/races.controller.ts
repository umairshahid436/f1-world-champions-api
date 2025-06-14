import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './services/races.service';
import { RaceDto } from './dtos/race.dto';
import { ApiParam, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Serialize } from '../../decorators/serialize.decorator';

@Controller('season/:year/races')
@ApiTags('Races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get('')
  @Serialize(RaceDto)
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
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  getSeasonRaces(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<RaceDto[]> {
    return this.racesService.getSeasonRaces(year);
  }
}

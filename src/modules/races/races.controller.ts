import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './services/races.service';
import { Serialize } from '@decorators/serialize.decorator';
import { RaceDto } from './dtos/race.dto';

@Controller('races')
@Serialize(RaceDto)
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get('season/:year')
  getSeasonRaces(@Param('year', ParseIntPipe) year: number) {
    return this.racesService.getSeasonRaces(year);
  }
}

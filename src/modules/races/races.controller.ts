import { Controller, Get } from '@nestjs/common';
import { RacesService } from './races.service';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  findAllRaces() {
    return this.racesService.findAllRaces();
  }
}

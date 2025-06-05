import { Controller, Get } from '@nestjs/common';

import { SeasonsService } from './seasons.service';
import { Serialize } from 'src/decorators/serialize.decorator';
import { SeasonDto } from './dtos/season-dto';

@Controller('seasons')
@Serialize(SeasonDto)
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get('')
  async getSeasonsChampions() {
    const data = await this.seasonsService.getSeasonsChampions(2005, 2025);
    console.log(data);
    return data;
  }
}

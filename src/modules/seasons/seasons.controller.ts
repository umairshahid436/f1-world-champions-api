import { Controller, Get, Query } from '@nestjs/common';
import { SeasonsService } from './services/seasons.service';
import { Serialize } from '@decorators/serialize.decorator';
import { SeasonDto } from './dtos/season-dto';
import { SeasonQueryDto } from './dtos/season-query.dto';

@Controller('seasons')
@Serialize(SeasonDto)
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get('champions')
  getSeasonsChampions(@Query() query: SeasonQueryDto) {
    const { fromYear, toYear } = query;
    return this.seasonsService.getSeasonsChampions(fromYear, toYear);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { SeasonsService } from './services/seasons.service';
import { Serialize } from '../../decorators/serialize.decorator';
import { SeasonDto } from './dtos/season.dto';
import { SeasonQueryDto } from './dtos/season-query.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('seasons')
@ApiTags('Seaons')
@Serialize(SeasonDto)
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get season champions',
    description: 'Retrieve F1 world champions for specified year range',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of season champions with driver and constructor information',
  })
  getSeasonsChampions(@Query() query: SeasonQueryDto) {
    return this.seasonsService.getSeasonsChampions(query);
  }
}

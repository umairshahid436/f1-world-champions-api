import { Module } from '@nestjs/common';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { ErgastModule } from '../external/ergast/ergast.module';

@Module({
  imports: [ErgastModule],
  controllers: [SeasonsController],
  providers: [SeasonsService],
})
export class SeasonsModule {}

import { Module } from '@nestjs/common';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';

@Module({
  providers: [RacesService],
  controllers: [RacesController],
})
export class RacesModule {}

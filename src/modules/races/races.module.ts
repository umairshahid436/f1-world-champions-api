import { Module } from '@nestjs/common';
import { RacesService } from './services/races.service';
import { RacesController } from './races.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../database/entities/driver.entity';
import { Race } from '../../database/entities/race.entity';
import { ErgastModule } from '../external/ergast/ergast.module';
import { RaceDataTransformationService } from './services/data-transformation.service';
import { DriversModule } from '../drivers/drivers.module';
import { SeasonsModule } from '../seasons/seasons.module';

@Module({
  imports: [
    ErgastModule,
    DriversModule,
    SeasonsModule,
    TypeOrmModule.forFeature([Driver, Race]),
  ],
  providers: [RacesService, RaceDataTransformationService],
  controllers: [RacesController],
  exports: [],
})
export class RacesModule {}

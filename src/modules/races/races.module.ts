import { Module } from '@nestjs/common';
import { RacesService } from './services/races.service';
import { RacesController } from './races.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '@entities/driver.entity';
import { Race } from '@entities/race.entity';
import { ErgastModule } from '@modules/external/ergast/ergast.module';
import { Season } from '@entities/season.entity';
import { RaceDataTransformationService } from './services/data-transformation.service';
import { DriversModule } from '@modules/drivers/drivers.module';
import { SeasonsModule } from '@modules/seasons/seasons.module';

@Module({
  imports: [
    ErgastModule,
    DriversModule,
    SeasonsModule,
    TypeOrmModule.forFeature([Season, Driver, Race]),
  ],
  providers: [RacesService, RaceDataTransformationService],
  controllers: [RacesController],
  exports: [],
})
export class RacesModule {}

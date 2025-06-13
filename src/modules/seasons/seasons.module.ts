import { Module } from '@nestjs/common';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './services/seasons.service';
import { ErgastModule } from '../external/ergast/ergast.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../../database/entities/season.entity';
import { Driver } from '../../database/entities/driver.entity';
import { Constructor } from '../../database/entities/constructor.entity';
import { DataTransformationService } from './services/data-transformation.service';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [
    ErgastModule,
    TypeOrmModule.forFeature([Season, Driver, Constructor]),
    DriversModule,
    ConstructorsModule,
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService, DataTransformationService],
  exports: [SeasonsService],
})
export class SeasonsModule {}

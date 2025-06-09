import { Module } from '@nestjs/common';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './services/seasons.service';
import { ErgastModule } from '@modules/external/ergast/ergast.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '@entities/season.entity';
import { Driver } from '@entities/driver.entity';
import { Constructor } from '@entities/constructor.entity';
import { DataTransformationService } from './services/data-transformation.service';
import { SeasonsRepository } from './repositories/seasons.repository';
import { DriversModule } from '@modules/drivers/drivers.module';
import { ConstructorsModule } from '@modules/constructors/constructors.module';

@Module({
  imports: [
    ErgastModule,
    TypeOrmModule.forFeature([Season, Driver, Constructor]),
    DriversModule,
    ConstructorsModule,
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService, SeasonsRepository, DataTransformationService],
  exports: [],
})
export class SeasonsModule {}

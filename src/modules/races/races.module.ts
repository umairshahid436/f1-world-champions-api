import { Module } from '@nestjs/common';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '@entities/driver.entity';
import { ErgastModule } from '@modules/external/ergast/ergast.module';
import { Season } from '@entities/season.entity';

@Module({
  imports: [ErgastModule, TypeOrmModule.forFeature([Season, Driver])],
  providers: [RacesService],
  controllers: [RacesController],
})
export class RacesModule {}

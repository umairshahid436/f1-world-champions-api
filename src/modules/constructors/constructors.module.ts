import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constructor } from '@src/database/entities/constructor.entity';
import { ConstructorsService } from './constructors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Constructor])],
  providers: [ConstructorsService],
  controllers: [],
  exports: [ConstructorsService],
})
export class ConstructorsModule {}

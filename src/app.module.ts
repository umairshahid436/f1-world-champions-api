import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { RacesModule } from './modules/races/races.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [SeasonsModule, RacesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule {}

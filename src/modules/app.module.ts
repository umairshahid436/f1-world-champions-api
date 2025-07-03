import {
  Module,
  ValidationPipe,
  BadRequestException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';

import { SeasonsModule } from './seasons/seasons.module';
import { RacesModule } from './races/races.module';
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { formatValidationErrors } from '../utils/utils';
import { DriversModule } from './drivers/drivers.module';
import { ConstructorsModule } from './constructors/constructors.module';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from './health/health.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    HealthModule,
    SeasonsModule,
    RacesModule,
    DriversModule,
    ConstructorsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
          const validationErrors = formatValidationErrors(errors);
          return new BadRequestException({
            message: 'Validation failed',
            errors: validationErrors,
          });
        },
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('Running database migrations...');
      const migrations = await this.dataSource.runMigrations();

      if (migrations.length > 0) {
        this.logger.log(
          `Successfully executed ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  - ${migration.name}`);
        });
      } else {
        this.logger.log('Database is up to date - no migrations to run');
      }
    } catch (err) {
      this.logger.error('Failed to run migrations', err);
      throw err;
    }
  }
}

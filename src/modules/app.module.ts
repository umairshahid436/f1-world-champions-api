import { Module, ValidationPipe, BadRequestException } from '@nestjs/common';
import { SeasonsModule } from './seasons/seasons.module';
import { RacesModule } from './races/races.module';
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { formatValidationErrors } from '@utils/validation.util';
import { DriversModule } from './drivers/drivers.module';
import { ConstructorsModule } from './constructors/constructors.module';
import { DatabaseModule } from './database.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    SeasonsModule,
    RacesModule,
    DriversModule,
    ConstructorsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
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
export class AppModule {}

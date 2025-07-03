import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerConfig } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend integration
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Setup Swagger documentation
  SwaggerConfig.setup(app, configService);

  await app.listen(port);
  logger.log(`Swagger UI: http://localhost:${port}/api-docs`);
  logger.log(`API is running on: http://localhost:${port}`);
}
void bootstrap();

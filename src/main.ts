import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import { SwaggerConfig } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const appUrl = `http://localhost:${port}`; // TODO: change to actual url

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend integration
  app.enableCors();

  // Setup Swagger documentation
  SwaggerConfig.setup(app, appUrl);

  await app.listen(port);
  logger.log(`Swagger UI: ${appUrl}/api-docs`);
  logger.log(`API is running on: http://localhost:${port}`);
}
void bootstrap();

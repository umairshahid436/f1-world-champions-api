import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS for frontend integration
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`API is running on port: ${port}`);
}
void bootstrap();

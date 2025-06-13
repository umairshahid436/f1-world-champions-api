import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  private static readonly logger = new Logger('SwaggerConfig');

  static setup(app: INestApplication): void {
    const port = process.env.PORT ?? 3000;
    const options = new DocumentBuilder()
      .setTitle('F1 World Champions API')
      .setDescription(
        'This API serves as the backend for SPA/Mobile applications displaying F1 World Champions and race data',
      )
      .setVersion('1.0')
      .addServer(`http://localhost:${port}/`, 'Local environment')
      .addTag('F1 World Champions API')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);
  }
}

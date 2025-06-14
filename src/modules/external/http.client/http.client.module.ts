import { Module } from '@nestjs/common';
import { HttpClientService } from './http.client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout
      maxRedirects: 3,
      headers: {
        'User-Agent': 'F1-World-Champions-API/1.0',
      },
    }),
  ],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}

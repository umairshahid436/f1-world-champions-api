import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ErgastService } from './ergast.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 10 seconds timeout
      maxRedirects: 3,
      headers: {
        'User-Agent': 'F1-World-Champions-API/1.0',
      },
    }),
  ],
  providers: [ErgastService],
  exports: [ErgastService],
})
export class ErgastModule {}

import { Module } from '@nestjs/common';
import { ErgastService } from './ergast.service';
import { HttpClientModule } from '../http.client/http.client.module';

@Module({
  imports: [HttpClientModule],
  providers: [ErgastService],
  exports: [ErgastService],
})
export class ErgastModule {}

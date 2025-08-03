import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ExchangeRateRepository],
})
export class AppModule {}

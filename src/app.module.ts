import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/exchange.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [ExchangeModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

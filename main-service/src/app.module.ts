import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/exchange.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExchangeModule,
  ],
})
export class AppModule {}

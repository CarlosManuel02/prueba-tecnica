import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { ClientsModule } from './clients/clients.module';

@Module({
  controllers: [ExchangeController],
  providers: [ExchangeService],
  imports: [ClientsModule],
})
export class ExchangeModule {}

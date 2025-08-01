import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { Api1Service } from './providers/api1.service';
import { Api3Service } from './providers/api3.service';
import { Api2Service } from './providers/api2.service';

@Module({
  controllers: [ExchangeController],
  providers: [ExchangeService, Api1Service, Api2Service, Api3Service],
  imports: [],
})
export class ExchangeModule {}

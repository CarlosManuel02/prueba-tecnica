import { Controller, Post, Body } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { ExchangeService } from './exchange.service';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('convert')
  async convert(
    @Body()
    body: {
      sourceCurrency: string;
      targetCurrency: string;
      amount: number;
    },
  ) {
    const { sourceCurrency, targetCurrency, amount } = body;

    const validResponses = await this.exchangeService.extracted(
      sourceCurrency,
      targetCurrency,
      amount,
    );

    return {
      input: { sourceCurrency, targetCurrency, amount },
      timestamp: new Date().toISOString(),
      offers: validResponses,
    };
  }
}

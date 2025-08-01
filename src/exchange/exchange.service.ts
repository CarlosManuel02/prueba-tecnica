import { Injectable } from '@nestjs/common';

import { CreateExchangeDto } from './dto/create-exchange.dto';
import { Builder, parseStringPromise } from 'xml2js';

@Injectable()
export class ExchangeService {
  constructor() {}

  private readonly exchangeRates: Record<string, Record<string, number>> = {
    USD: { USD: 1, EUR: 0.91, GBP: 0.78, DOP: 59.0, MXN: 17.0, CAD: 1.35 },
    EUR: { USD: 1.1, EUR: 1, GBP: 0.86, DOP: 64.8, MXN: 18.7, CAD: 1.48 },
    GBP: { USD: 1.28, EUR: 1.16, GBP: 1, DOP: 75.5, MXN: 21.5, CAD: 1.72 },
    DOP: {
      USD: 0.017,
      EUR: 0.0154,
      GBP: 0.0132,
      DOP: 1,
      MXN: 0.29,
      CAD: 0.023,
    },
    MXN: { USD: 0.059, EUR: 0.053, GBP: 0.046, DOP: 3.4, MXN: 1, CAD: 0.079 },
    CAD: { USD: 0.74, EUR: 0.67, GBP: 0.58, DOP: 43.5, MXN: 12.6, CAD: 1 },
  };

  private getRate(from: string, to: string): number {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    // Check if both currencies are the same
    const fromRates = this.exchangeRates[fromUpper];
    if (!fromRates) {
      throw new Error(`Unsupported source currency: ${from}`);
    }
    // If the source and target currencies are the same, throw an error
    const rate = fromRates[toUpper];
    if (rate === undefined) {
      throw new Error(`Unsupported currency conversion from ${from} to ${to}`);
    }

    return rate;
  }

  async getFromApi1(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto;
    const rate = this.getRate(sourceCurrency, targetCurrency);

    try {
      const result = amount * rate;

      return {
        rate: result,
      };
    } catch (error) {
      throw new Error(`Error calculating rate: ${error.message}`);
    }
  }

  async getFromApi2(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto.exchange;
    const rate = this.getRate(sourceCurrency, targetCurrency);

    try {
      const xmlResponse = `<Result>${amount * rate}</Result>`;
      const result = await parseStringPromise(xmlResponse);
      return {
        converted: parseFloat(result.Result),
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error calculating rate: ${error.message}`,
        data: null,
      };
    }
  }

  async getFromApi3(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto.exchange;
    const rate = this.getRate(sourceCurrency, targetCurrency);
    try {
      const total = amount * rate;

      return {
        statusCode: 200,
        message: 'Exchange rate',
        data: total.toFixed(2),
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error calculating rate: ${error.message}`,
        data: null,
      };
    }
  }

  async handleXmlApi2(body: string, contentType: string): Promise<string> {
    if (!contentType.includes('xml')) {
      throw new Error('Expected XML content');
    }

    let parsed: any;
    try {
      parsed = await parseStringPromise(body, { explicitArray: false });
    } catch (e) {
      throw new Error('Invalid XML input');
    }

    const dto: CreateExchangeDto = {
      exchange: {
        sourceCurrency: parsed.XML.From,
        targetCurrency: parsed.XML.To,
        amount: parseFloat(parsed.XML.Amount),
      },
    };

    if (isNaN(dto.exchange.amount)) {
      throw new Error('Amount must be a valid number');
    }

    const result = await this.getFromApi2(dto);

    const builder = new Builder({ headless: true, rootName: 'XML' });
    return builder.buildObject({
      Result: result.converted,
    });
  }
}

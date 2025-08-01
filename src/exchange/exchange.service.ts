import { Injectable } from '@nestjs/common';

import { CreateExchangeDto } from './dto/create-exchange.dto';
import { Builder, parseStringPromise } from 'xml2js';

@Injectable()
export class ExchangeService {
  constructor() {}

  async getFromApi1(dto: CreateExchangeDto) {
    const rate = 0.9;
    const { amount } = dto;

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
    const rate = 0.9;

    try {
      const xmlResponse = `<Result>${dto.exchange.amount * rate}</Result>`;
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
    const rate = 0.9;
    try {
      const total = dto.exchange.amount * rate;

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

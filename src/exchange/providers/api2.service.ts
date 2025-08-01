import { Injectable } from '@nestjs/common';
import { CreateExchangeDto } from '../dto/create-exchange.dto';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class Api2Service {
  async getRate(dto: CreateExchangeDto) {
    const rate = 0.95;

    try {
      const xmlResponse = `<Result>${(dto.amount * rate).toFixed(2)}</Result>`;
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
}

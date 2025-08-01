import { Injectable } from '@nestjs/common';
import { CreateExchangeDto } from '../dto/create-exchange.dto';

@Injectable()
export class Api3Service {
  async getRate(dto: CreateExchangeDto) {
    const rate = 0.9;
    try {
      const total = dto.amount * rate;

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
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateExchangeDto } from '../dto/create-exchange.dto';

@Injectable()
export class Api1Service {
  async getRate(dto: CreateExchangeDto) {
    const rate = 0.91;
    try {
      const result = dto.amount * rate;

      return {
        rate: result,
      };
    } catch (error) {
      throw new Error(`Error calculating rate: ${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly exchangeRateRepository: ExchangeRateRepository,
  ) {}

  /**
   * Procesa una solicitud de conversión desde API1
   * @param dto Datos de la solicitud de conversión
   * @returns Resultado de la conversión
   */
  async getFromApi1(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto;

    try {
      // usa el repositorio para obtener la tasa de cambio
      const rate = this.exchangeRateRepository.getRate(
        sourceCurrency,
        targetCurrency,
      );
      const result = amount * rate;

      return {
        rate: result,
      };
    } catch (error) {
      throw new Error(`Error calculating rate: ${error}`);
    }
  }
}

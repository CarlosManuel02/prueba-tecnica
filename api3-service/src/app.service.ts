import { Injectable } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly exchangeRateRepository: ExchangeRateRepository,
  ) {}

  /**
   * Procesa una solicitud de conversión desde API3
   * @param dto Datos de la solicitud de conversión
   * @returns Resultado estructurado de la conversión:
   */
  async getFromApi3(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto.exchange;

    try {
      // Usar el repository para obtener la tasa
      const rate = this.exchangeRateRepository.getRate(
        sourceCurrency,
        targetCurrency,
      );

      const total = amount * rate;

      return {
        statusCode: 200,
        message: 'Transaction successful',
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
}

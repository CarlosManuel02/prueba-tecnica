import { Injectable } from '@nestjs/common';

/**
 * Repository Pattern: Repositorio para tasas de cambio en API1
 */
@Injectable()
export class ExchangeRateRepository {
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

  /**
   * Obtiene la tasa de cambio entre dos monedas
   * @param from Moneda origen
   * @param to Moneda destino
   * @returns Tasa de cambio
   */
  getRate(from: string, to: string): number {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    const fromRates = this.exchangeRates[fromUpper];
    if (!fromRates) {
      throw new Error(`Moneda origen no soportada: ${from}`);
    }

    const rate = fromRates[toUpper];
    if (rate === undefined) {
      throw new Error(`Conversión no soportada de ${from} a ${to}`);
    }

    return rate;
  }
}

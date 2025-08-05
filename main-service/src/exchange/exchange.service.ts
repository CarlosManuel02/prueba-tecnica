import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExchangeService {
  private readonly API1_URL: string;
  private readonly API2_URL: string;
  private readonly API3_URL: string;

  constructor(private configService: ConfigService) {
    // Utiliza ConfigService para obtener las URLs de las APIs
    this.API1_URL = this.configService.get<string>(
      'API1_URL',
      'http://localhost:3001',
    );
    this.API2_URL = this.configService.get<string>(
      'API2_URL',
      'http://localhost:3002',
    );
    this.API3_URL = this.configService.get<string>(
      'API3_URL',
      'http://localhost:3003',
    );
  }

  /**
   * Fetches exchange rate from API1
   * @param sourceCurrency
   * @param targetCurrency
   * @param amount
   * @return Promise resolving to exchange rate data: { provider, convertedAmount }
   */
  fechApi1(sourceCurrency: string, targetCurrency: string, amount: number) {
    return axios
      .post(`${this.API1_URL}/api1`, {
        // Use configurable URL
        sourceCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        amount: amount,
      })
      .then((res) => ({
        provider: 'API1',
        convertedAmount: amount * res.data.rate,
      }));
  }

  /**
   * Fetches exchange rate from API2
   * @param sourceCurrency
   * @param targetCurrency
   * @param amount
   * @return Promise resolving to exchange rate data: <XML><Result>convertedAmount</Result></XML>
   */
  fechApi2(sourceCurrency: string, targetCurrency: string, amount: number) {
    return axios
      .post(
        `${this.API2_URL}/api2`,
        `<XML><From>${sourceCurrency}</From><To>${targetCurrency}</To><Amount>${amount}</Amount></XML>`,
        { headers: { 'Content-Type': 'application/xml' } },
      )
      .then(async (res) => {
        console.log('API2 Response:', res.data);

        return {
          provider: 'API2',
          data: res.data,
        };
      });
  }

  /**
   * Fetches exchange rate from API3
   * @param sourceCurrency
   * @param targetCurrency
   * @param amount
   * @return Promise resolving to exchange rate data: { provider, statusCode, message, data: { total } }
   */
  fechApi3(sourceCurrency: string, targetCurrency: string, amount: number) {
    return axios
      .post(`${this.API3_URL}/api3`, {
        exchange: {
          sourceCurrency,
          targetCurrency,
          amount: amount,
        },
      })
      .then(async (res) => {
        console.log('API3 Response:', res.data);

        return {
          provider: 'API3',
          ...res.data,
        };
      })
      .catch((error) => {
        console.error('Error fetching from API3:', error);
        throw new Error('Failed to fetch data from API3');
      });
  }

  /**
   * Extracts exchange rates from multiple APIs.
   * @param sourceCurrency The currency to convert from.
   * @param targetCurrency The currency to convert to.
   * @param amount The amount to convert.
   * @returns An array of conversion results from the APIs.
   */
  async extracted(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
  ): Promise<any[]> {
    /**
     *Input {from, to, value}
     * Output {rate}
     */
    const api1 = this.fechApi1(sourceCurrency, targetCurrency, amount);

    /**
     * Input <XML><From/><To/><Amount/></XML>
     * Output <XML><Result/></XML>
     */
    const api2 = this.fechApi2(sourceCurrency, targetCurrency, amount);

    /**
     * Input{exchange: {sourceCurrency, targetCurrency, quantity}}
     * Output {statusCode, message, data: {total}}
     */
    const api3 = this.fechApi3(sourceCurrency, targetCurrency, amount);

    const results = await Promise.allSettled([api1, api2, api3]);

    console.log('API Results:', results);
    const validResponses = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    if (validResponses.length === 0) {
      throw new Error('All APIs failed');
    }
    return validResponses;
  }
}

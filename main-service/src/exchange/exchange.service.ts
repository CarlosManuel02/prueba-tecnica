import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExchangeService {
  constructor() {}

  async extracted(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
  ) {
    const api1 = axios
      .post('http://api1-service:3001/api1', {
        sourceCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        amount: amount,
      })
      .then((res) => ({
        provider: 'API1',
        conversionRate: res.data.rate,
        convertedAmount: amount * res.data.rate,
      }));

    const api2 = axios
      .post(
        'http://api2-service:3002/api2',
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

    const api3 = axios
      .post('http://api3-service:3003/api3', {
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
      });

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

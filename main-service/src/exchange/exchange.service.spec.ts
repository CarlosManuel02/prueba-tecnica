import { Test, type TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { jest } from '@jest/globals'; // Only import 'jest' itself

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
  Builder: jest.fn(() => ({
    buildObject: jest.fn(),
  })),
}));
const mockedParseStringPromise = parseStringPromise as jest.Mocked<
  typeof parseStringPromise
>;

describe('ExchangeService', () => {
  let service: ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeService],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return successful responses from all APIs', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { rate: 0.9 } })
      .mockResolvedValueOnce({ data: '<XML><Result>90</Result></XML>' })
      .mockResolvedValueOnce({
        data: {
          statusCode: 200,
          message: 'Transaction successful',
          data: '90.00',
        },
      }); // API3

    mockedParseStringPromise.mockResolvedValueOnce({ XML: { Result: '90' } });

    const sourceCurrency = 'USD';
    const targetCurrency = 'EUR';
    const amount = 100;

    const result = await service.extracted(
      sourceCurrency,
      targetCurrency,
      amount,
    );

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      provider: 'API1',
      conversionRate: 0.9,
      convertedAmount: 90,
    });
    expect(result[1]).toEqual({
      provider: 'API2',
      data: '<XML><Result>90</Result></XML>',
    });
    expect(result[2]).toEqual({
      provider: 'API3',
      statusCode: 200,
      message: 'Transaction successful',
      data: '90.00',
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://api1-service:3001/api1',
      {
        sourceCurrency,
        targetCurrency,
        amount,
      },
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://api2-service:3002/api2',
      `<XML><From>${sourceCurrency}</From><To>${targetCurrency}</To><Amount>${amount}</Amount></XML>`,
      { headers: { 'Content-Type': 'application/xml' } },
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://api3-service:3003/api3',
      {
        exchange: { sourceCurrency, targetCurrency, amount },
      },
    );
  });

  it('should handle API failures and return only successful responses', async () => {
    mockedAxios.post
      .mockRejectedValueOnce(new Error('API1 failed'))
      .mockResolvedValueOnce({ data: '<XML><Result>90</Result></XML>' })
      .mockRejectedValueOnce(new Error('API3 failed'));

    mockedParseStringPromise.mockResolvedValueOnce({ XML: { Result: '90' } });

    const sourceCurrency = 'USD';
    const targetCurrency = 'EUR';
    const amount = 100;

    const result = await service.extracted(
      sourceCurrency,
      targetCurrency,
      amount,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      provider: 'API2',
      data: '<XML><Result>90</Result></XML>',
    });
  });

  it('should throw an error if all APIs fail', async () => {
    mockedAxios.post
      .mockRejectedValueOnce(new Error('API1 failed'))
      .mockRejectedValueOnce(new Error('API2 failed'))
      .mockRejectedValueOnce(new Error('API3 failed'));

    const sourceCurrency = 'USD';
    const targetCurrency = 'EUR';
    const amount = 100;

    await expect(
      service.extracted(sourceCurrency, targetCurrency, amount),
    ).rejects.toThrow('All APIs failed');
  });

  it("should correctly process API2 response when API2's XML parsing fails", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { rate: 0.9 } }); // API1 succeeds
    mockedAxios.post.mockRejectedValueOnce(
      new Error('API2 processing failed due to invalid XML'),
    ); // API2 rejects
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        statusCode: 200,
        message: 'Transaction successful',
        data: '90.00',
      },
    });


    const sourceCurrency = 'USD';
    const targetCurrency = 'EUR';
    const amount = 100;

    const result = await service.extracted(
      sourceCurrency,
      targetCurrency,
      amount,
    );

    expect(result).toHaveLength(2);
    expect(result.some((r) => r.provider === 'API2')).toBe(false);
  });
});

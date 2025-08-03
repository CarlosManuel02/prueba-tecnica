import { Test, type TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';
import type { CreateExchangeDto } from './dto/create-exchange.dto';
import { jest } from '@jest/globals';

describe('AppService (api1-service)', () => {
  let appService: AppService;
  let exchangeRateRepository: ExchangeRateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ExchangeRateRepository,
          useValue: {
            getRate: jest.fn(),
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    exchangeRateRepository = module.get<ExchangeRateRepository>(
      ExchangeRateRepository,
    );
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('should return the correct conversion rate for valid input', async () => {
    const dto: CreateExchangeDto = {
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      amount: 100,
    };
    const expectedRate = 0.91;
    (exchangeRateRepository.getRate as jest.Mock).mockReturnValue(expectedRate);

    const result = await appService.getFromApi1(dto);

    expect(exchangeRateRepository.getRate).toHaveBeenCalledWith(
      dto.sourceCurrency,
      dto.targetCurrency,
    );
    expect(result).toEqual({ rate: dto.amount * expectedRate });
  });

  it('should throw an error if the exchange rate cannot be obtained', async () => {
    const dto: CreateExchangeDto = {
      sourceCurrency: 'XYZ',
      targetCurrency: 'ABC',
      amount: 100,
    };
    const errorMessage = 'Moneda origen no soportada: XYZ';
    (exchangeRateRepository.getRate as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(appService.getFromApi1(dto)).rejects.toThrow(
      `Error calculating rate: ${errorMessage}`,
    );
  });
});

import { Test, type TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';
import type { CreateExchangeDto } from './dto/create-exchange.dto';
import { parseStringPromise, Builder } from 'xml2js';
import { jest } from '@jest/globals';

jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
  Builder: jest.fn(() => ({
    buildObject: jest.fn(),
  })),
}));

const mockedParseStringPromise = parseStringPromise as jest.Mocked<
  typeof parseStringPromise
>;
const mockedBuilder = Builder as jest.MockedClass<typeof Builder>;

describe('AppService (api2-service)', () => {
  let appService: AppService;
  let exchangeRateRepository: ExchangeRateRepository;
  let mockBuilderInstance: any;

  beforeEach(async () => {
    mockBuilderInstance = {
      buildObject: jest.fn(),
    };
    mockedBuilder.mockImplementation(() => mockBuilderInstance);

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('getFromApi2', () => {
    it('should calculate the correct conversion and return structured result', async () => {
      const dto: CreateExchangeDto = {
        exchange: {
          sourceCurrency: 'USD',
          targetCurrency: 'EUR',
          amount: 100,
        },
      };
      const expectedRate = 0.91;
      (exchangeRateRepository.getRate as jest.Mock).mockReturnValue(
        expectedRate,
      );
      mockedParseStringPromise.mockResolvedValueOnce({ Result: '91' });

      const result = await appService.getFromApi2(dto);

      expect(exchangeRateRepository.getRate).toHaveBeenCalledWith('USD', 'EUR');
      expect(mockedParseStringPromise).toHaveBeenCalledWith(
        '<Result>91</Result>',
      );
      expect(result).toEqual({ converted: 91 });
    });

    it('should return an error object if exchange rate calculation fails', async () => {
      const dto: CreateExchangeDto = {
        exchange: {
          sourceCurrency: 'XYZ',
          targetCurrency: 'EUR',
          amount: 100,
        },
      };
      const errorMessage = 'Moneda origen no soportada: XYZ';
      (exchangeRateRepository.getRate as jest.Mock).mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const result = await appService.getFromApi2(dto);

      expect(result).toEqual({
        statusCode: 500,
        message: `Error calculating rate: ${errorMessage}`,
        data: null,
      });
    });
  });

  describe('handleXmlApi2', () => {
    const validXmlBody = `<XML><From>USD</From><To>EUR</To><Amount>100</Amount></XML>`;
    const expectedRate = 0.91;

    it('should parse XML, calculate conversion, and return XML response', async () => {
      mockedParseStringPromise
        .mockResolvedValueOnce({
          XML: { From: 'USD', To: 'EUR', Amount: '100' },
        })
        .mockResolvedValueOnce({ Result: '91' });
      (exchangeRateRepository.getRate as jest.Mock).mockReturnValue(
        expectedRate,
      );
      mockBuilderInstance.buildObject.mockReturnValue(
        '<XML><Result>91</Result></XML>',
      );

      const result = await appService.handleXmlApi2(
        validXmlBody,
        'application/xml',
      );

      expect(mockedParseStringPromise).toHaveBeenCalledWith(validXmlBody, {
        explicitArray: false,
      });
      expect(exchangeRateRepository.getRate).toHaveBeenCalledWith('USD', 'EUR');
      expect(mockBuilderInstance.buildObject).toHaveBeenCalledWith({
        Result: 91,
      });
      expect(result).toBe('<XML><Result>91</Result></XML>');
    });

    it('should throw an error if content-type is not XML', async () => {
      await expect(
        appService.handleXmlApi2(validXmlBody, 'application/json'),
      ).rejects.toThrow('Expected XML content');
    });

    it('should throw an error for invalid XML input', async () => {
      mockedParseStringPromise.mockRejectedValueOnce(new Error('Syntax error'));

      await expect(
        appService.handleXmlApi2('<invalid-xml>', 'application/xml'),
      ).rejects.toThrow('Invalid XML input');
    });

    it('should throw an error if amount is not a valid number in XML', async () => {
      const invalidAmountXml = `<XML><From>USD</From><To>EUR</To><Amount>abc</Amount></XML>`;
      mockedParseStringPromise.mockResolvedValueOnce({
        XML: { From: 'USD', To: 'EUR', Amount: 'abc' },
      });

      await expect(
        appService.handleXmlApi2(invalidAmountXml, 'application/xml'),
      ).rejects.toThrow('Amount must be a valid number');
    });

    it('should return XML with error message if getFromApi2 fails internally', async () => {
      const errorMessage = 'Conversion not supported';
      mockedParseStringPromise.mockResolvedValueOnce({
        XML: { From: 'USD', To: 'XYZ', Amount: '100' },
      });
      (exchangeRateRepository.getRate as jest.Mock).mockImplementation(() => {
        throw new Error(errorMessage);
      });
      mockBuilderInstance.buildObject.mockReturnValueOnce(
        `<XML><Result><statusCode>500</statusCode><message>Error calculating rate: ${errorMessage}</message><data>null</data></Result></XML>`,
      );

      const result = await appService.handleXmlApi2(
        validXmlBody,
        'application/xml',
      );

      expect(exchangeRateRepository.getRate).toHaveBeenCalledWith('USD', 'XYZ');
      expect(mockBuilderInstance.buildObject).toHaveBeenCalledWith({
        Result: undefined,
      });
      expect(result).toBe(
        `<XML><Result><statusCode>500</statusCode><message>Error calculating rate: ${errorMessage}</message><data>null</data></Result></XML>`,
      );
    });
  });
});

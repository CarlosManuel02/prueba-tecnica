import { Test, type TestingModule } from "@nestjs/testing"
import { AppService } from "./app.service"
import { ExchangeRateRepository } from "./repositories/exchange-rate.repository"
import type { CreateExchangeDto } from "./dto/create-exchange.dto"
import { jest } from "@jest/globals"

describe("AppService (api3-service)", () => {
  let appService: AppService
  let exchangeRateRepository: ExchangeRateRepository

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
    }).compile()

    appService = module.get<AppService>(AppService)
    exchangeRateRepository = module.get<ExchangeRateRepository>(ExchangeRateRepository)
  })

  it("should be defined", () => {
    expect(appService).toBeDefined()
  })

  it("should return the correct structured conversion result for valid input", async () => {
    const dto: CreateExchangeDto = {
      exchange: {
        sourceCurrency: "USD",
        targetCurrency: "EUR",
        amount: 100,
      },
    }
    const expectedRate = 0.91
    ;(exchangeRateRepository.getRate as jest.Mock).mockReturnValue(expectedRate)

    const result = await appService.getFromApi3(dto)

    expect(exchangeRateRepository.getRate).toHaveBeenCalledWith(
      dto.exchange.sourceCurrency,
      dto.exchange.targetCurrency,
    )
    expect(result).toEqual({
      statusCode: 200,
      message: "Transaction successful",
      data: (dto.exchange.amount * expectedRate).toFixed(2),
    })
  })

  it("should return an error object if the exchange rate cannot be obtained", async () => {
    const dto: CreateExchangeDto = {
      exchange: {
        sourceCurrency: "XYZ",
        targetCurrency: "ABC",
        amount: 100,
      },
    }
    const errorMessage = "Moneda origen no soportada: XYZ"
    ;(exchangeRateRepository.getRate as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const result = await appService.getFromApi3(dto)

    expect(result).toEqual({
      statusCode: 500,
      message: `Error calculating rate: ${errorMessage}`,
      data: null,
    })
  })
})

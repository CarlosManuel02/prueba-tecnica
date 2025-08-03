import { ExchangeRateRepository } from "./exchange-rate.repository"

describe("ExchangeRateRepository (api3-service)", () => {
  let repository: ExchangeRateRepository

  beforeEach(() => {
    repository = new ExchangeRateRepository()
  })

  it("should return the correct rate for supported currency pair (USD to EUR)", () => {
    expect(repository.getRate("USD", "EUR")).toBe(0.91)
  })

  it("should return the correct rate for supported currency pair (EUR to MXN)", () => {
    expect(repository.getRate("EUR", "MXN")).toBe(18.7)
  })

  it("should return 1 for same currency conversion", () => {
    expect(repository.getRate("GBP", "GBP")).toBe(1)
  })

  it("should be case insensitive for currency codes", () => {
    expect(repository.getRate("usd", "eur")).toBe(0.91)
    expect(repository.getRate("eUr", "mXn")).toBe(18.7)
  })

  it("should throw an error for an unsupported source currency", () => {
    expect(() => repository.getRate("ABC", "USD")).toThrow("Moneda origen no soportada: ABC")
  })

  it("should throw an error for an unsupported target currency", () => {
    expect(() => repository.getRate("USD", "XYZ")).toThrow("Conversión no soportada de USD a XYZ")
  })
})

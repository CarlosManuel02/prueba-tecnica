import { validate } from 'class-validator';
import { CreateExchangeDto } from './dto/create-exchange.dto';

describe('CreateExchangeDto', () => {
  it('validates when flat format is provided and valid', async () => {
    const dto = new CreateExchangeDto();
    dto.sourceCurrency = 'USD';
    dto.targetCurrency = 'EUR';
    dto.amount = 100;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('validates when nested format is provided and valid', async () => {
    const dto = new CreateExchangeDto();
    dto.exchange = {
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      amount: 100,
    };
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails validation when neither flat nor nested format is provided', async () => {
    const dto = new CreateExchangeDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails validation when flat format is missing required fields', async () => {
    const dto = new CreateExchangeDto();
    dto.sourceCurrency = 'USD';
    // targetCurrency and amount missing
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails validation when nested format is missing required fields', async () => {
    const dto = new CreateExchangeDto();
    dto.exchange = {
      sourceCurrency: 'USD',
      targetCurrency: '', //  empty targetCurrency
      amount: null as any, // null amount
    };
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails validation when amount is not a number in flat format', async () => {
    const dto = new CreateExchangeDto();
    dto.sourceCurrency = 'USD';
    dto.targetCurrency = 'EUR';
    dto.amount = 'abc' as any; // invalid amount
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

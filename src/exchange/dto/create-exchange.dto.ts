import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateExchangeDto {
  @IsString()
  @IsNotEmpty()
  sourceCurrency: string;

  @IsString()
  @IsNotEmpty()
  targetCurrency: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

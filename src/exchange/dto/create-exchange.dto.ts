import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateExchangeDto {
  // Formato plano
  @ValidateIf((o) => !o.exchange)
  @IsString()
  @IsNotEmpty()
  sourceCurrency?: string;

  @ValidateIf((o) => !o.exchange)
  @IsString()
  @IsNotEmpty()
  targetCurrency?: string;

  @ValidateIf((o) => !o.exchange)
  @IsNumber()
  @IsNotEmpty()
  amount?: number;

  // Formato anidado
  @ValidateIf((o) => !o.sourceCurrency)
  @IsNotEmpty()
  exchange?: {
    sourceCurrency: string;
    targetCurrency: string;
    amount: number;
  };
}


import { Injectable } from '@nestjs/common';
import { Builder, parseStringPromise } from 'xml2js';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly exchangeRateRepository: ExchangeRateRepository,
  ) {}

  /**
   * Procesa una solicitud de conversión desde API2
   * @param dto Datos de la solicitud de conversión
   * @returns Resultado estructurado de la conversión:
   */
  async getFromApi2(dto: CreateExchangeDto) {
    const { amount, sourceCurrency, targetCurrency } = dto.exchange;

    try {
      // Usar el repository para obtener la tasa
      const rate = this.exchangeRateRepository.getRate(
        sourceCurrency,
        targetCurrency,
      );
      const xmlResponse = `<Result>${amount * rate}</Result>`;
      const result = await parseStringPromise(xmlResponse);
      return {
        converted: parseFloat(result.Result),
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error calculating rate: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   *   * Maneja las solicitudes XML de API2
   *    * @param body Cuerpo XML de la solicitud
   *    * @param contentType Tipo de contenido
   *    * @returns Respuesta XML formateada
   */
  async handleXmlApi2(body: string, contentType: string): Promise<string> {
    // Verifica que el tipo de contenido sea XML
    if (!contentType.includes('xml')) {
      throw new Error('Expected XML content');
    }

    let parsed: any;
    try {
      parsed = await parseStringPromise(body, { explicitArray: false });
    } catch (e) {
      throw new Error('Invalid XML input');
    }

    // crea el DTO a partir del XML
    const dto: CreateExchangeDto = {
      exchange: {
        sourceCurrency: parsed.XML.From,
        targetCurrency: parsed.XML.To,
        amount: parseFloat(parsed.XML.Amount),
      },
    };

    // Validación de los campos del DTO
    if (isNaN(dto.exchange.amount)) {
      throw new Error('Amount must be a valid number');
    }

    //  procesa la solicitud de conversión
    const result = await this.getFromApi2(dto);

    // Construye la respuesta XML
    const builder = new Builder({ headless: true, rootName: 'XML' });
    return builder.buildObject({
      Result: result.converted,
    });
  }
}

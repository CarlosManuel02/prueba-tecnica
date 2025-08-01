import { Controller, Post, Body, Res, Headers } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { Response } from 'express';


@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('api1')
  async getRateFromApi1(@Body() dto: CreateExchangeDto) {
    console.log('Received DTO:', dto);
    return this.exchangeService.getFromApi1(dto);
  }

  @Post('api2')
  async getRateFromApi2(
    @Body() body: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string,
  ) {
    const xmlResponse = await this.exchangeService.handleXmlApi2(
      body,
      contentType,
    );
    res.setHeader('Content-Type', 'application/xml');
    res.send(xmlResponse);
  }

  @Post('api3')
  async getRateFromApi3(@Body() dto: CreateExchangeDto) {
    return this.exchangeService.getFromApi3(dto);
  }
}

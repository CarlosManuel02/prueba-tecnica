import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api3')
  async getRateFromApi3(@Body() dto: CreateExchangeDto) {
    return this.appService.getFromApi3(dto);
  }
}

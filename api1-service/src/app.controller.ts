import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api1')
  async getRateFromApi1(@Body() dto: CreateExchangeDto) {
    console.log('Received DTO:', dto);
    return this.appService.getFromApi1(dto);
  }
}

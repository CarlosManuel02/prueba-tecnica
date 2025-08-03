import { Controller, Post, Body, Res, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api2')
  async getRateFromApi2(
    @Body() body: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string,
  ) {
    const xmlResponse = await this.appService.handleXmlApi2(body, contentType);
    res.setHeader('Content-Type', 'application/xml');
    res.send(xmlResponse);
  }
}

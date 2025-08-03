import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { xmlBodyParser } from './common/middlewares/xml-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(xmlBodyParser);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`API2 Service is running on port ${process.env.PORT ?? 3001}`);

}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors({
    origin: process.env.ORIGIN,
    credentials: true,
  });

  app.useLogger(app.get(Logger));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

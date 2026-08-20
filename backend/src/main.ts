import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de segurança padrão (XSS, sniffing, clickjacking...)
  app.use(helmet());
  app.use(cookieParser());

  // CORS restrito à origem do frontend; credentials=true porque o refresh
  // token viaja em cookie httpOnly.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // Validação global: qualquer payload fora do DTO é rejeitado (whitelist
  // remove campos desconhecidos — evita mass assignment).
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`🚀 Spotly API em http://localhost:${port}/api`);
}
bootstrap();

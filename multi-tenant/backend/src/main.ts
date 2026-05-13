import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `${timestamp} [${context ?? 'App'}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:9000'];

  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();

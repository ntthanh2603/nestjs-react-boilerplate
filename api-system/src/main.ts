import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  API_SYSTEM_DESCRIPTION,
  API_SYSTEM_NAME,
} from './common/constants/app.constants';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
var Fingerprint = require('express-fingerprint');

const API_SYSTEM_PORT = process.env.API_SYSTEM_PORT;
const API_SYSTEM_VERSION = process.env.API_SYSTEM_VERSION;
const CONSOLE_URL = process.env.CONSOLE_URL;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.use(
    Fingerprint({
      parameters: [Fingerprint.useragent],
    }),
  );

  // Configure CORS
  app.enableCors({
    origin: CONSOLE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // Configure global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Config swagger
  const config = new DocumentBuilder()
    .setTitle(API_SYSTEM_NAME)
    .setDescription(API_SYSTEM_DESCRIPTION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .setVersion(API_SYSTEM_VERSION!)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(API_SYSTEM_PORT!);

  const logger = new Logger('Application');
  logger.log(`🚀🚀🚀 Application is running on port ${API_SYSTEM_PORT}`);
}
bootstrap();

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/http.filter';
import { ValidationException } from './shared/validation.exception';

export function covertErrorToObject(errors: ValidationError[]) {
  const result = {};

  for (const error of errors) {
    result[error.property] = Object.values(error.constraints)[0];
    if (Object.keys(error.children).length > 0) {
      result[error.property] = covertErrorToObject(error.children);
    }
  }

  return result;
}

// Nice to have
// move to utils covererror
// compression
// helmet
// config database
// custom interceptor instace of class-validator

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configService = app.get(ConfigService);

  const port = configService.get('PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new ValidationException(covertErrorToObject(errors));
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, '0.0.0.0');
}
bootstrap();

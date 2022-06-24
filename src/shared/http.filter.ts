import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { DatabaseError, ValidationError } from 'sequelize';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();
    let status = 500;

    let errors = {};

    let meta = {};

    if (exception instanceof DatabaseError && process.env.NODE_ENV === 'dev') {
      meta = {
        sql: exception.sql,
        parameters: exception.parameters,
        stack: exception.stack,
        original: exception.original,
      };
    }

    if (exception instanceof ValidationError) {
      errors = exception.errors.reduce((acc, e) => {
        acc[e.path] = e.message;

        return acc;
      }, {});

      status = HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errors = exception.getResponse();
    }

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: errors,
      message: exception.message,
      meta,
    });
  }
}

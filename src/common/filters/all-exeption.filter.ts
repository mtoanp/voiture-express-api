import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      httpStatus = HttpStatus.CONFLICT; // 409
    }

    const errorMessage = this.getErrorMessage(exception);
    const path = httpAdapter.getRequestUrl(request);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
      message: errorMessage,
    };

    // structured error logging
    this.logger.error(
      `[${httpStatus}] ${path} → ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getErrorMessage(exception: unknown): string | object {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return typeof res === 'string' ? res : { ...res };
    }

    // ✅ Handle Prisma unique constraint error (e.g., email already exists)
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      const targetField = (exception.meta?.target as string[])?.[0] ?? 'field';
      return `${targetField.charAt(0).toUpperCase() + targetField.slice(1)} is already in use`;
    }

    if (exception instanceof Error) {
      return exception.message || 'Internal server error';
    }

    return 'Unexpected error occurred';
  }
}

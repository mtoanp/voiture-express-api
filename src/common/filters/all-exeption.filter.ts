import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
// import { PrismaClientValidationError } from 'generated/prisma/runtime/library';
// import { MyLoggerService } from './my-logger/my-logger.service';
import path from 'path';

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
// export class AllExceptionFilter extends BaseExceptionFilter {
//   // private readonly logger = new MyLoggerService(AllExceptionFilter.name); // Use logger

//   catch(exception: unknown, host: ArgumentsHost): void {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const request = ctx.getRequest();

//     const myResponseObj: MyResponseObj = {
//       statusCode: 200,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//       response: '',
//     };

//     if (exception instanceof HttpException) {
//       myResponseObj.statusCode = exception.getStatus();
//       myResponseObj.response = exception.getResponse();
//     } else if (exception instanceof PrismaClientValidationError) {
//       myResponseObj.statusCode = 422;
//       myResponseObj.response = exception.message.replaceAll(/\n/g, '');
//     } else {
//       myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
//       myResponseObj.response = 'Internal Server Error';
//     }

//     response.status(myResponseObj.statusCode).json(myResponseObj);

//     // this.logger.error(myResponseObj.response, AllExceptionFilter.name); // Log the error message

//     super.catch(exception, host); // Call the parent class's catch method to handle the exception
//   }
// }
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    // LOGGING HERE
    // this.logger.error(
    //   `Exception caught: ${JSON.stringify(responseBody)}\nException: ${exception instanceof Error ? exception.stack : exception}`,
    // );

    // Reply to client
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

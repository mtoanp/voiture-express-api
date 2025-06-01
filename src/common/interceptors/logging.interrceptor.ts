import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import chalk from 'chalk';
import { formatTimestampLocal } from '../utils/date';

// 🖍️ Force color for Docker logs
chalk.level = 3;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 🔍 Extract context info
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const now = Date.now();

    // 🌐 Request metadata
    const method = chalk.magenta(req.method);
    const url = chalk.cyan(req.originalUrl);

    // Time on both dev + product
    // const timestamp = chalk.gray(`[${formatTimestampLocal()}] `);

    // Time only on production
    const timestamp =
      process.env.NODE_ENV === 'production'
        ? chalk.gray(`[${formatTimestampLocal()}] `)
        : '';

    // 🔵 Request START log
    console.log(chalk.gray('────────────────────────────────────────────'));
    console.log(
      `${timestamp}${method} ${url} > ` +
        chalk.green(controller) +
        ' > ' +
        chalk.yellow(handler),
    );

    return next.handle().pipe(
      // ✅ Successful response
      tap(() => {
        const time = Date.now() - now;
        const statusCode = res.statusCode;
        const statusColor =
          statusCode >= 200 && statusCode < 300 ? chalk.green : chalk.red;

        console.log(
          chalk.green('✅') +
            ' ' +
            statusColor(statusCode.toString()) +
            ' - ' +
            chalk.blue(`${time}ms`),
        );
      }),

      // ❌ Error handling
      catchError((err) => {
        const time = Date.now() - now;
        const status = err?.status || res.statusCode || 500;

        console.log(
          chalk.red('❌') +
            ' ' +
            chalk.red(status.toString()) +
            ' - ' +
            chalk.blue(`${time}ms`) +
            ' - ' +
            chalk.red(`Error: ${err?.message}`),
        );

        return throwError(() => err);
      }),
    );
  }
}

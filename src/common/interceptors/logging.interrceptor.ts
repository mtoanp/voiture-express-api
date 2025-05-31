import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import chalk from 'chalk';
chalk.level = 3; // Force-enable color support (0 = no color, 3 = 16M colors) > Docker's logs colorized

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const now = Date.now();

    const method = chalk.magenta(req.method);
    const url = chalk.cyan(req.originalUrl);

    console.log(chalk.gray('────────────────────────────────────────────'));
    // 🟢 FIRST LOG — on request arrival
    console.log(
      `${method} ${url} > ` +
        chalk.green(controller) +
        ' > ' +
        chalk.yellow(handler),
    );

    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - now;
        const statusCode = res.statusCode;
        const statusColor =
          statusCode >= 200 && statusCode < 300 ? chalk.green : chalk.red;

        // ✅ FINAL LOG — after response
        console.log(
          chalk.green('✅') +
            ' ' +
            statusColor(statusCode.toString()) +
            ' - ' +
            chalk.blue(`${time}ms`),
        );
      }),
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

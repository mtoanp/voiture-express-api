import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const stripPassword = (obj: any) => {
          if (obj && typeof obj === 'object' && 'password' in obj) {
            const { password, ...rest } = obj;
            return rest;
          }
          return obj;
        };

        if (Array.isArray(data)) {
          return data.map(stripPassword);
        }

        return stripPassword(data);
      }),
    );
  }
}

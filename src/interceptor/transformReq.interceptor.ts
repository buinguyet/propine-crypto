import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
  error?: any;
  time: Date;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  errorException = (err: any) => {
    const statusCode = err?.response?.statusCode || err.status || 500;
    const message = err?.response?.message || err.message;
    const error = err?.response?.error || err.error;
    const data = null;
    return {
      statusCode,
      message,
      error,
      data,
      time: new Date(),
    };
  };

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        const statusCode = result?.statusCode || 200;
        if (statusCode) {
          delete result.statusCode;
          context.switchToHttp().getResponse().status(statusCode);
        }
        const data = result || [];

        return {
          statusCode,
          data,
          time: new Date(),
        };
      }),
      catchError((err) =>
        throwError(() => {
          const error = this.errorException(err);
          return new HttpException(error, error.statusCode);
        }),
      ),
    );
  }
}

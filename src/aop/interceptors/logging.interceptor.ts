import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    console.log(`request started [${method}]: ${url}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `  [${method}] ${url} — Completed in ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = performance.now();
    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - now).toFixed(2);
        console.log(`  Execution time: ${duration}ms`);
      }),
    );
  }
}

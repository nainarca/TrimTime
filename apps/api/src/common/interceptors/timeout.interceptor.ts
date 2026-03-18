import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Don't apply timeout to GraphQL subscriptions (long-lived connections)
    if (context.getType<GqlContextType>() === 'graphql') {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

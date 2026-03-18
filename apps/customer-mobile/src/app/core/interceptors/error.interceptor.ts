import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // eslint-disable-next-line no-console
        console.error('[HTTP Error]', {
          url:     req.url,
          status:  error.status,
          message: error.message,
        });

        // 401 — token expired; the auth service will redirect to login
        // All other errors are re-thrown for the calling code to handle
        return throwError(() => error);
      }),
    );
  }
}

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
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly notifications: NotificationService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log to console for debugging
        // eslint-disable-next-line no-console
        console.error('HTTP error', {
          url: req.url,
          status: error.status,
          message: error.message,
          error,
        });

        const message =
          (error.error && (error.error.message || error.error.error)) ||
          error.message ||
          'An unexpected error occurred';

        this.notifications.error('Request failed', message);

        return throwError(() => error);
      }),
    );
  }
}


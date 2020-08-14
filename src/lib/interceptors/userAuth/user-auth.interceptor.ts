import { Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class UserAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService
  ) {
  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // обрабатываем 401 и 624 статусы и ведем на авторизацию
        if (error.status === 401 || error.status === 624) {
          if (isDevMode()) {
            this.authService.login().subscribe((resp) => {
              window.location = resp;
            });
          } else {
            window.location.href = '/node-api/login/?redirectPage=' + window.location.pathname +
              window.location.search + window.location.hash;
          }
        }
        return throwError(error);
      }));
  }


}

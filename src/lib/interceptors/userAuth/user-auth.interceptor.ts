import { Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from '../../services/cookie/cookie.service';

@Injectable()
export class UserAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService
  ) {
  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if(error.status === 401 && request.url.indexOf('api/pay/v1/informer/fetch') !== -1) {
          return next.handle(request);
        }
        // обрабатываем 401 и 624 статусы и ведем на авторизацию
        if (error.status === 401 || error.status === 624) {
          this.cookieService.remove('acc_t');
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

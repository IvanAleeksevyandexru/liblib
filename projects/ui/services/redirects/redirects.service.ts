import { Injectable, isDevMode } from '@angular/core';
import { CookieService } from '@epgu/ui/services/cookie';

@Injectable({
  providedIn: 'root'
})
export class RedirectsService {

  constructor(
    private cookieService: CookieService,
  ) { }

  public redirectToOrganizationView() {
    const urlsMap = {
      '/profile/transport/vehicles': '/info/transports',
      '/profile/personal': '/info'
    };
    if (!isDevMode()) {
      this.cookieService.set('lkul', 'always');
      this.cookieService.set('old-lk', '1');
      location.href = urlsMap[location.pathname] || '/';
    }
  }
}

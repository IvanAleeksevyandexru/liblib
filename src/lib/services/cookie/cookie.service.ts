import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor(private loadService: LoadService) {
  }

  public set(name: string, value: string | number, expireDays?: number): void {
    let expires;
    if (expireDays === 0) {
      expires = `; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else if (expireDays) {
      const date = new Date();
      date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    } else {
      expires = '';
    }
    document.cookie = `${name}=${value}${expires}; domain=${this.loadService.config.cookieDomain}; path=/`;
  }

  public get(name: string): string {
    let cookieValue = '';
    const cookieArray = (' ' + document.cookie).split(';');
    cookieArray.forEach((item) => {
      const splitedItem = item.split('=');
      if (splitedItem.indexOf(` ${name}`) === 0 || splitedItem.indexOf(`${name}`) === 0) {
        cookieValue = splitedItem[1];
      }
    });
    return cookieValue;
  }

  public remove(name: string): void {
    this.set(name, '', 0);
  }

}

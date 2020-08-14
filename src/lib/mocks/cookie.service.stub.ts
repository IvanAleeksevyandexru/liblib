import { Injectable } from '@angular/core';

@Injectable()
export class CookieServiceStub {

  private cookieData = 'CookieData';

  public get(): string {
    return this.cookieData;
  }

  public set(): void {

  }

}

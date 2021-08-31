import { Injectable } from '@angular/core';
import { SmuEvent, SmuEventRequest, SmuParamsAsObj } from "../../models/smu";

@Injectable({
  providedIn: 'root'
})
export class SmuEventsService {

  public smuInit = false;
  private isMPBusiness = document.cookie && document.cookie.split('; ').some((key) => {
    return key.indexOf('mobVersionBusiness') > -1;
  });
  private posfix = this.isMPBusiness ? '-BUISNESS' : '';
  private platform = navigator.userAgent.match(/Android/i) ? 'android' :
    (navigator.userAgent.match(/iPhone|iPad|iPod/i) ? 'ios' : 'wp');

  private ios = {
    notify: (e) => {
      let s = document.createElement('IFRAME');
      s.setAttribute('src', 'javascript-bridge:' + e);
      document.documentElement.appendChild(s);
      s.parentNode.removeChild(s);
      s = null;
      const i = (window as any).objCReturnValue;
      delete (window as any).objCReturnValue;
      return i;
    }
  };

  constructor() {
  }

  public setPlatform(platform: string): void {
    this.platform = platform;
  }

  public getPlatform(): string {
    return `${this.platform}${this.posfix}`;
  }

  public init(): void {
    this.smuInit = true;
  }

  public notify(e: SmuEvent) {
    if (this.smuInit) {
      const smuEvent = JSON.stringify(e);
      switch (this.platform) {
        case 'android':
          return (window as any).Android.notify(smuEvent);
        case 'wp':
          (window as any).external.notify(smuEvent);
          break;
        case 'ios':
          return this.ios.notify(smuEvent);
        default:
          throw new TypeError('invalid "platfrom" type');
      }
    }
  }

  public pushEvent(type: string, params: SmuParamsAsObj): void {
    const event = new SmuEventRequest(type, params);
    this.notify(event);
  }
}

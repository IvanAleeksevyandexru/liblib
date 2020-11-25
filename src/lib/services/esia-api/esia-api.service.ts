import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HelperService } from '../helper/helper.service';
import { CookieService } from '../cookie/cookie.service';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { map } from 'rxjs/operators';
import { OfferSettings, PermissionScope, PermissionScopes } from '../../models/permission.model';

export interface Citizenship {
  name: string;
  char3Code: string;
  msgKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class EsiaApiService {

  private host: string;
  private userOid: string;

  private versions = {
    0: '/rs/',
    1: '/esia-rs/api/public/v1/',
    2: '/esia-rs/api/public/v2/',
    digital: '/digital/api/public/v1/',
    smevint: '/smevint/api/public/v1/'
  };

  public citizenship = new BehaviorSubject<Array<Citizenship>>(null);

  private config = new BehaviorSubject<any>(null);
  public config$ = this.config.asObservable();

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private cookieService: CookieService,
  ) { }

  private initParams(): void {
    this.host = this.loadService.config.esiaUrl;
    this.userOid = this.loadService.user.userId ? this.loadService.user.userId.toString() : null;
  }

  private setUrl(input: string, version: 0 | 1 | 2 | 'digital' | 'smevint' = 0): string {
    return this.host + this.versions[version] + input.replace(/prn_oid/, this.userOid);
  }

  public getRequest(
    method: string,
    version: 0 | 1 | 2 | 'digital' | 'smevint' = 0,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<any> {
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.get(url, options);
  }

  public postRequest(
    method: string,
    version: 0 | 1 | 2 | 'digital' | 'smevint' = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<any> {
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.post(url, body, options);
  }

  public putRequest(
    method: string,
    version: 0 | 1 | 2 | 'digital' | 'smevint' = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<any> {
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.put(url, body, options);
  }

  public deleteRequest(
    method: string,
    version: 0 | 1 | 2 | 'digital' | 'smevint' = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<any> {
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    if (body) {
      options.body = body;
      return this.http.request('delete', url, options);
    } else {
      return this.http.delete(url, options);
    }
  }

  public loadConfig() {
    this.getRequest('profile/config', 1).subscribe((data: any) => {
      this.config.next(data);
    });
  }

  public loadCitizenship() {
    this.getRequest('citizenship', 1).subscribe(res => {
      if (res && res.values) {
        this.citizenship.next(res.values);
      }
    });
  }

  public checkDigitalScopes(sysname?: string | string[]): Observable<boolean | boolean[]> {
    return this.getRequest('prns/prn_oid/issued/permissions/digital/scopes', 1).pipe(
      map((scopes: PermissionScopes) => {
        if (sysname) {
          if (Array.isArray(sysname)) {
            const result = [];

            sysname.forEach((item: string) => {
              result.push(scopes.elements.some((scope: PermissionScope) => scope.sysname === item));
            });

            return result;
          } else {
            return scopes.elements.some((scope: PermissionScope) => scope.sysname === sysname);
          }
        } else {
          return scopes.elements.length > 0;
        }
      })
    );
  }

  public checkOffer() {
    return new Promise((resolve, reject) => {
      this.loadService.loaded.subscribe((loaded: boolean) => {
        if (loaded) {
          this.initParams();

          if (isDevMode()) {
            resolve();
          } else {
            this.getRequest(`prns/prn_oid/permissions/settings`, 1)
              .toPromise()
              .then((settings: OfferSettings) => {
                if (settings.showAnyForms && (settings.showOffer || settings.showPolicy)) {
                  this.goToOffer(false);
                  reject();
                }
                resolve();
              }, () => {
                resolve();
              });
          }
        }
      });
    });
  }

  public goToOffer(force = true): void {
    const url = (window as any).location.href;

    if (force) {
      this.cookieService.set('needOffer', 1);
    }

    (window as any).location.href = `${this.loadService.config.esiaUrl}/profile/offer?go_back=${url}`;
  }

}

import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HelperService } from '@epgu/ui/services/helper';
import { CookieService } from '@epgu/ui/services/cookie';
import { LoadService } from '@epgu/ui/services/load';
import { OfferSettings, PermissionScope, PermissionScopes } from '@epgu/ui/models';

export interface Citizenship {
  name: string;
  char3Code: string;
  msgKey: string;
}

export type VersionsApi = 0 | 1 | 2 | 3 | 4 | 'digital'  | 'digitalV2' | 'smevint' | 'registration' | 'mobid';

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
    3: '/esia-rs/api/public/v3/',
    4: '/esia-rs/api/public/v4/',
    digital: '/digital/api/public/v1/',
    digitalV2: '/digital/api/public/v2/',
    smevint: '/smevint/api/public/v1/',
    registration: '/registration/api/public/v1/',
    mobid: '/mob-id-back/api/public/v1/'
  };

  private citizenship: Citizenship[];

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

  private setUrl(input: string, version: VersionsApi = 0): string {
    return this.host + this.versions[version] + input.replace(/prn_oid/, this.userOid);
  }

  public getRequest<T>(
    method: string,
    version: VersionsApi  = 0,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<T> {
    this.initParams();
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.get<T>(url, options);
  }

  public postRequest<T>(
    method: string,
    version: VersionsApi  = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<T> {
    this.initParams();
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.post<T>(url, body, options);
  }

  public putRequest<T>(
    method: string,
    version: VersionsApi  = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<T> {
    this.initParams();
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    return this.http.put<T>(url, body, options);
  }

  public deleteRequest<T>(
    method: string,
    version: VersionsApi  = 0,
    body?: any,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): Observable<T> {
    this.initParams();
    const url = this.setUrl(method, version);
    const token = this.cookieService.get('acc_t');
    const options = HelperService.setRequestOptions(token, extra);

    if (body) {
      options.body = body;
      return this.http.request<T>('delete', url, options);
    } else {
      return this.http.delete<T>(url, options);
    }
  }

  public loadConfig(): void {
    this.getRequest('profile/config', 1).subscribe((data: any) => {
      this.config.next(data);
    });
  }

  public get citizenship$(): Observable<Citizenship[]> {
    if (this.citizenship) {
      return of(this.citizenship);
    } else {
      return this.getRequest<{values: Citizenship[]}>('citizenship', 1).pipe(
        map(res => res.values),
        tap(citizenship => this.citizenship = citizenship)
      );
    }
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

  public checkOffer(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadService.loaded.subscribe((loaded: boolean) => {
        if (loaded) {
          this.initParams();

          if (isDevMode()) {
            resolve(true);
          } else {
            this.getRequest(`prns/prn_oid/permissions/settings`, 1)
              .toPromise()
              .then((settings: OfferSettings) => {
                if (settings.showAnyForms && (settings.showOffer || settings.showPolicy)) {
                  this.goToOffer(false);
                  reject();
                }
                resolve(true);
              }, () => {
                resolve(true);
              });
          }
        }
      });
    });
  }

  public goToOffer(force = true, backUrl?: string, additional?: {[key: string]: string}): void {
    const url = backUrl ? backUrl : (window as any).location.href;

    const params = new HttpParams({
      fromObject: {
        go_back: encodeURIComponent(url),
        ...(additional)
      }
    });
    const getParams = decodeURIComponent(params.toString()); // Add-hoc: .toString() делает свой encode переменной go_back

    if (force) {
      this.cookieService.set('needOffer', 1);
    }

    (window as any).location.href = `${this.loadService.config.esiaUrl}/profile/offer?${getParams}`;
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '../helper/helper.service';
import { CookieService } from '../cookie/cookie.service';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';

@Injectable({
  providedIn: 'root'
})
export class EsiaApiLibService {

  private versions = {
    0: '/rs/',
    1: '/esia-rs/api/public/v1/',
    2: '/esia-rs/api/public/v2/',
    digital: '/digital/api/public/v1/',
    smevint: '/smevint/api/public/v1/'
  };

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private cookieService: CookieService,
  ) { }

  public setUrl(input: string, version: 0 | 1 | 2 | 'digital' | 'smevint' = 0): string {
    const host = this.loadService.config.esiaUrl;
    const userOid = this.loadService.user.userId ? this.loadService.user.userId.toString() : null;

    return host + this.versions[version] + input.replace(/prn_oid/, userOid);
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

}

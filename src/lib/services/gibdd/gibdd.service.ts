import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';
import { Gibdd } from '../../models/gibdd';

@Injectable({
  providedIn: 'root'
})
export class GibddService {

  constructor(private http: HttpClient,
              private loadService: LoadService) { }

  public getGibddDetails(uid: string, hash: string): Observable<Gibdd> {
    return this.http.get<Gibdd>(`${this.loadService.config.ipshApi}informer/gibdd/details/${uid}?md5=${hash}`,
      {
        withCredentials: true
      });
  }

  public getPhoto(details) {
    return this.http.get(`${this.loadService.config.proxyUrl}gibdd/photo`,
      {
        params: {
          div: details.deptCode,
          md5: details.signature,
          reg: details.carNumber,
          uin: details.uin
        }
      });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';
import { Service } from '../../models/service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly catalogUrl = this.loadService.config.catalogApiUrl;

  constructor(
    private http: HttpClient,
    private loadService: LoadService
  ) {
  }

  public getService(sid: string, eid = '', ignorePlatform?: boolean, oldStyle = false, isManual = false): Observable<Service> {
    const params = new URLSearchParams();

    params.set('_', String(Math.random()));
    params.set('region', this.loadService.attributes.selectedRegion);
    params.set('rUrl', this.loadService.config.urlLk + 'orders/all');
    params.set('oldStyleCode', String(oldStyle));
    params.set('isManual', String(isManual));
    if (!ignorePlatform) {
      params.set('platform', this.loadService.config.platform);
    }

    return this.http.get<Service>(`${this.catalogUrl}services/${sid}_${eid}?${params}`, {
      withCredentials: true
    });
  }

  public getOrderNames(frguCodes: number[]) {
    return this.http.post(`${this.loadService.config.catalogApiUrl}passportsByExtId`, frguCodes, {
      withCredentials: true
    });
  }
}

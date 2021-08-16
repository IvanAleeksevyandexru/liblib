import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import { GetPassportRequest, GetServiceRequest, Passport, Service, ServicePermission } from '@epgu/ui/models';
import { CookieService } from '@epgu/ui/services/cookie';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly catalogUrl = this.loadService.config.catalogApiUrl;

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private cookieService: CookieService
  ) {
  }

  public getService(request: GetServiceRequest): Observable<Service> {
    const params = new URLSearchParams();

    params.set('_', String(Math.random()));
    params.set('region', this.loadService.attributes.selectedRegion);
    params.set('rUrl', this.loadService.config.urlLk + 'orders/all');
    params.set('oldStyleCode', String(request.oldStyle));
    params.set('isManual', String(request.isManual));
    if (!request.ignorePlatform) {
      params.set('platform', this.loadService.config.platform);
    }

    return this.http.get<Service>(`${this.catalogUrl}services/${request.sid}_${request.eid}?${params}`, {
      withCredentials: true
    });
  }

  public getPassport(request: GetPassportRequest): Observable<Passport> {
    const params = new URLSearchParams();

    params.set('_', String(Math.random()));
    params.set('region', this.loadService.attributes.selectedRegion);
    if (!request.ignorePlatform) {
      params.set('platform', this.loadService.config.platform);
    }

    return this.http.get<Passport>(`${this.catalogUrl}passports/${request.id}?${params}`, {
      withCredentials: true
    });
  }

  public checkPermissions(passportId: string, targetId: string): Observable<Array<ServicePermission>> {
    return this.http.get<Array<ServicePermission>>(`${this.loadService.config.catalogApiUrl}services/${passportId + '_' + targetId}/check?_=${Math.random()}`, {
      params: {
        platform: this.loadService.config.platform
      },
      withCredentials: true
    });
  }

  public getOrderNames(frguCodes: number[]) {
    return this.http.post(`${this.loadService.config.catalogApiUrl}passportsByExtId`, frguCodes, {
      withCredentials: true
    });
  }

  public checkMfcRegion() {
    const region = this.cookieService.get('userSelectedRegion') || '00000000000';
    return this.http.get(`${this.loadService.config.catalogApiUrl}mfc/config/${region}`, {
      withCredentials: true,
      params: { _: String(Math.random()) }
    });
  }
}

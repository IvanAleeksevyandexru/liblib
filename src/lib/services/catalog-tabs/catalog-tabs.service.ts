import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import { Faqs, PopularFederal, RegionalPopular } from '../../models/catalog';

@Injectable({
  providedIn: 'root'
})
export class CatalogTabsService {

  // TODO: интерфейсы
  public catalogTabsData: any = {};
  public catalogTabsList: any;
  public departmentsData: any;

  constructor(
    public loadService: LoadService,
    private http: HttpClient
  ) {
  }

  public storeCatalogData(data: any, code: string): void {
    this.catalogTabsData[code] = data;
  }

  public getDataCatalogStoreData(code: string): any {
    return this.catalogTabsData[code];
  }

  public getCatalogPopular(code: string): Observable<PopularFederal> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code)[0]);
    }
    return this.http.get<PopularFederal>(`${this.loadService.config.catalogApiUrl}categories/${code}`, {
      params: {
        _: `${Math.random()}`,
        platform: `EPGU_V3`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getCatalogRegionPopular(code: string): Observable<RegionalPopular[]> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code)[1]);
    }
    return this.http.get<RegionalPopular[]>(`${this.loadService.config.catalogApiUrl}passports/region/categories/${code}`, {
      params: {
        _: `${Math.random()}`,
        platform: `EPGU_V3`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getFaqCategories(code: string): Observable<any> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code)[2]);
    }
    return this.http.get<any>(`${this.loadService.config.catalogApiUrl}elm/get/serviceCategories/${code}`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getFaqItemCategory(code: string, categoryCode: string): Observable<any> {
    return this.http.get<any>(`${this.loadService.config.cmsUrl}faq/categories/${code}`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getDepartmentsData(): Observable<any> {
    if (this.departmentsData) {
      return of(this.departmentsData);
    }
    return this.http.get<any>(`${this.loadService.config.catalogApiUrl}departments/menu`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }
}

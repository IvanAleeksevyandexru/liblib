import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import {
  CatalogData,
  Departments,
  FaqCategories,
  FaqCategoriesCMS,
  Faqs,
  PopularFederal,
  RegionalPopular
} from '../../models/catalog';

@Injectable({
  providedIn: 'root'
})
export class CatalogTabsService {

  public catalogTabsData: {[key: string]: any} = {};
  public catalogTabsList: CatalogData[];
  public departmentsData: Departments[];

  constructor(
    public loadService: LoadService,
    private http: HttpClient
  ) {
  }

  public storeCatalogData(data: [PopularFederal, RegionalPopular[], Departments[], FaqCategoriesCMS[]], code: string): void {
    this.catalogTabsData[code] = data;
  }

  public getDataCatalogStoreData(code: string): any {
    return this.catalogTabsData[code];
  }

  public getCatalogPopular(code: string): Observable<PopularFederal> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code)[0]);
    }
    return this.http.get<PopularFederal>(`${this.loadService.config.catalogApiService}catalog/person/categories/${code}`, {
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

  public getFaqCategories(code: string): Observable<FaqCategories> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code)[2]);
    }
    return this.http.get<FaqCategories>(`${this.loadService.config.catalogApiUrl}elm/get/serviceCategories/${code}`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getFaqItemCategory(code: string, categoryCode: string): Observable<FaqCategoriesCMS> {
    return this.http.get<FaqCategoriesCMS>(`${this.loadService.config.cmsUrl}faq/categories/${code}`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }

  public getDepartmentsData(): Observable<Departments[]> {
    if (this.departmentsData) {
      return of(this.departmentsData);
    }
    return this.http.get<Departments[]>(`${this.loadService.config.catalogApiService}departments`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }
}

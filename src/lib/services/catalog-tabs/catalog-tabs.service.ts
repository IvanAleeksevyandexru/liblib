import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import { Faqs, PopularFederal, RegionalPopular } from '../../models/catalog';

@Injectable({
  providedIn: 'root'
})
export class CatalogTabsService {

  public catalogTabsData: any = {};
  public catalogTabsList: any;

  constructor(
    public loadService: LoadService,
    private http: HttpClient
  ) {
  }

  public storeCatalogData(data: any, code: string, isMainPageView): void {
    if (!this.catalogTabsData[code]) {
      if(!isMainPageView) {
        this.catalogTabsData[code] = {
          popular: data[0],
          regionPopular: data[1],
          faqs: {
            faq: {
              items: []
            }
          }
        }
      } else {
        this.catalogTabsData[code] = {
          popular: data[0],
          regionPopular: data[1],
          faqs: data[2]
        }
      }
    }
  }

  public getDataCatalogStoreData(code: string, type: string): any {
    return this.catalogTabsData[code][type];
  }

  public getCatalogPopular(code: string): Observable<PopularFederal> {
    if (this.catalogTabsData[code]) {
      return of(this.getDataCatalogStoreData(code, 'popular'));
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
      return of(this.getDataCatalogStoreData(code, 'regionPopular'));
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

  public getCatalogFaqs(code: string, isFaqRequestNeed): Observable<Faqs> {
    if(!isFaqRequestNeed) {
      return of({faq: {items: []}}) as any;
    }
    if (this.catalogTabsData[code] && this.getDataCatalogStoreData(code, 'faqs').faq?.items?.length) {
      return of(this.getDataCatalogStoreData(code, 'faqs'));
    }
    return this.http.get<Faqs>(`${this.loadService.config.catalogApiUrl}elm/get/serviceCategories/${code}`, {
      params: {
        _: `${Math.random()}`,
        region: `${this.loadService.attributes.selectedRegion}`
      },
      withCredentials: true
    });
  }
}

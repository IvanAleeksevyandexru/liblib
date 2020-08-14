import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Coords, Region, RegionSuggestion } from '../../models/location';
import { LookupProvider } from '../../models/dropdown.model';
import { PlatformLocation } from '@angular/common';
import { CountersService } from '../counters/counters.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  public userSelectedRegionCode: string;
  public userSelectedRegionName: string;
  public userSelectedRegionPath: string;
  public firstTimeShow = true;

  public defaultRegion = {
    id: '00000000000',
    name: 'Российская Федерация',
    path: 'Российская Федерация'
  };

  public currentCoords: Coords = {
    latitude: 0,
    longitude: 0
  };

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private locationPlatform: PlatformLocation,
    private countersService: CountersService
  ) {
  }

  public onPopState(): void {
    this.locationPlatform.onPopState((evt) => {
      this.countersService.doCountersApiRequest()
        .subscribe((data) => {
          this.countersService.setCounters(data);
        });
    });
  }

  public clearRegion() {
    return this.http.post(
      `${this.loadService.config.lkApiUrl}users/region`, {}, {withCredentials: true}
    );
  }

  public detectRegion() {
    return this.http.get<Region>(`${this.loadService.config.nsiApiUrl}epgu/detectRegion?_=${Math.random()}`, {
      withCredentials: true
    });
  }

  public getCurrentLocation(params: any) {

    return this.http
      .get<Region>(`${this.loadService.config.nsiApiUrl}epgu/region/geo`, {
        withCredentials: true,
        params
      });
  }

  public getSearchRegionProvider(): LookupProvider {
    const http = this.http;
    const loadService = this.loadService;
    return {
      search(query: string, configuration?: { [name: string]: any }) {
        return http
          .get(`${loadService.config.nsiApiUrl}epgu/region/`, {
            withCredentials: true,
            params: {
              pageNum: '0',
              pageSize: '10',
              q: `${query}`
            }
          })
          .toPromise()
          .then((suggestions: RegionSuggestion[]) => {
            return suggestions.map((item, i) => {
              return {
                id: item.code,
                text: item.path
              };
            });
          });
      }
    };
  }


  public getCoordsByAddress(addresses) {
    const out = addresses.map((item) => {
      return /россия/i.test(item) ? item : 'Россия, ' + item;
    });
    return this.http.post(
      `${this.loadService.config.nsiApiUrl}address/resolve`,
      {
        address: out
      },
      {
        withCredentials: true,
      }
    );
  }

  public regionCheck(checkId) {
    return this.http.get(
      `${this.loadService.config.nsiApiUrl}epgu/region/${this.loadService.attributes.selectedRegion}/service/${checkId}`,
      {
        withCredentials: true,
        params: {
          _: `${Math.random()}`
        }
      }
    );
  }
}

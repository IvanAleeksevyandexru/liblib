import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { Coords, Region, RegionSuggestion } from '@epgu/ui/models';
import { LookupPartialProvider, LookupProvider } from '@epgu/ui/models/dropdown';
import { PlatformLocation } from '@angular/common';
import { CountersService } from '@epgu/ui/services/counters';
import { CookieService } from '@epgu/ui/services/cookie';
import { of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  public userSelectedRegionCode: string;
  public userSelectedRegionName: string;
  public userSelectedRegionPath: string;
  public userSelectedRegionCodes: string[];

  public defaultRegion = {
    id: '00000000000',
    name: 'Российская Федерация',
    path: 'Российская Федерация'
  };

  public currentCoords: Coords = {
    latitude: 0,
    longitude: 0
  };

  private savedDetectRegion: Region;
  public savedDetectRegion$ = new BehaviorSubject<Region>(null);

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private locationPlatform: PlatformLocation,
    private countersService: CountersService,
    private cookieService: CookieService
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
    if (this.savedDetectRegion) {
      return of(this.savedDetectRegion);
    }
    return this.http.get<Region>(`${this.loadService.config.nsiApiUrl}epgu/detectRegion?_=${Math.random()}`, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.savedDetectRegion = response;
        this.savedDetectRegion$.next(response);
        if (!this.cookieService.get('userSelectedRegion') && this.savedDetectRegion.code) {
          this.cookieService.set('userSelectedRegion', this.savedDetectRegion.code)
        }
      })
    );
  }

  public getCurrentLocation(params: any) {

    return this.http
      .get<Region>(`${this.loadService.config.nsiApiUrl}epgu/region/geo`, {
        withCredentials: true,
        params
      });
  }

  public getSearchRegionProvider(): LookupPartialProvider {
    const http = this.http;
    const loadService = this.loadService;
    return {
      searchPartial(query: string, page: number, configuration?: { [name: string]: any }) {
        return http
          .get(`${loadService.config.nsiApiUrl}epgu/region/`, {
            withCredentials: true,
            params: {
              pageNum: page,
              pageSize: '10',
              q: query
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

  public getFederalOcato(okato: string): string {
    const district = okato ? okato.substring(0, 5) : '';
    let region = okato ? (okato.substring(0, 2) + '00') : '0000';
    if (district.match('^711[0-38]\\d$')) {
      region = '7110'; // Ханты-Мансийский автономный округ - Югра
    } else if (district.match('^711[4-7]\\d$')) {
      region = '7114'; // ЯНАО
    } else if (district.match('^111\\d{2}$')) {
      region = '1110'; // Ненецкий автономный округ
    }

    return region + '0000000';
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

  public regionCheck(regionCode: string, checkId: string, checkTargetId: string) {
    return this.http.get(
      `${this.loadService.config.nsiApiUrl}epgu/region/${regionCode}/service/${checkId}`,
      {
        withCredentials: true,
        params: {
          _: `${Math.random()}`,
          epguCode: checkTargetId,
        }
      }
    );
  }
}

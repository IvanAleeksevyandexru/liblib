import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import { CookieService } from '@epgu/ui/services/cookie';
import { SearchService } from '@epgu/ui/services/search';
import { MainPageContentInterface } from '@epgu/ui/models';
import { FrameType } from '@epgu/ui/models';
import { IMainData } from '@epgu/ui/models/main-data';
import { User } from '@epgu/ui/models/user';
import { LocationService } from '@epgu/ui/services/location';

@Injectable({
  providedIn: 'root'
})
export class MainPageService {

  public mainPageData = new BehaviorSubject<MainPageContentInterface>(null);
  public config = this.loadService.config;
  public user = this.loadService.user as User;
  public executed = false;
  public mainBlocksData: IMainData;
  private mainBgType: BehaviorSubject<string> = new BehaviorSubject<string>('person');
  public mainBgType$ = this.mainBgType.asObservable();

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private cookieService: CookieService,
    private searchService: SearchService,
    private locationService: LocationService,
  ) {
  }

  public getAll() {
    let params: { [key: string]: string };
    if (this.user.authorized) {
      params = {
        personType: this.getPersonType(this.user.type),
        region: this.cookieService.get('userSelectedRegion') || '00000000000',
        _: Math.random().toString()
      };
      this.getData(params);
      this.setBgType();
    } else {
      this.loadService.userTypeNA$.subscribe(type => {
        params = {
          personType: this.getPersonType(type),
          region: this.cookieService.get('userSelectedRegion') || '00000000000',
          _: Math.random().toString()
        };
        this.getData(params);
        this.setBgType();
      });
    }
  }

  private getData(params: { [key: string]: string }): void {
    this.http.get<MainPageContentInterface>(this.config.cmsUrl + 'main', {
      withCredentials: true,
      params
    }).subscribe(res => {
      this.mainPageData.next(res);
      if (res?.searchConfig?.placeholder) {
        this.searchService.setGlobalSearchPlaceholder(res.searchConfig.placeholder);
      }
    });
  }

  private getPersonType(userType: string): string {
    let personType = 'PERSON';
    switch (userType) {
      case 'L':
        personType = 'LEGAL';
        break;
      case 'B':
        personType = 'SOLE_PROPRIETOR';
        break;
    }
    return personType;
  }

  public getMainBlocksData(isPortalMainPage?: boolean): Observable<IMainData> {
    if (this.mainBlocksData) {
      return of(this.mainBlocksData);
    }
    let region = ''; // нужен только главной портала. при переходах в ЛК или партнеры идет перезагрузка, поэтому сохраненные данные будут только внутри текущего домена
    if (isPortalMainPage) {
      region = this.locationService.getFederalOcato(this.cookieService.get('userSelectedRegion') || '00000000000');
    }
    const params = `type=person${region ? '&region=' + region : ''}&_=${Math.random()}`;
    return this.http.get<IMainData>(`${this.loadService.config.mainBlocksData}?${params}`, {
      withCredentials: true
    });
  }

  private setBgType() {
    if (this.user.authorized) {
      this.mainBgType.next(this.getBgType(this.user.type));
    } else {
      this.loadService.userTypeNA$.subscribe(type => {
        this.mainBgType.next(this.getBgType(type));
      });
    }
  }

  private getBgType(userType: string): FrameType {
    return userType === 'L' ? 'legal' : userType === 'B' ? 'business' : 'person';
  }

}

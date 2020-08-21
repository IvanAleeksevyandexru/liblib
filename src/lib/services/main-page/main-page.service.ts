import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { LoadService } from '../load/load.service';
import { CookieService } from '../cookie/cookie.service';
import { FrameType, MainPageContentInterface } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class MainPageService {

  public mainPageData = new BehaviorSubject<MainPageContentInterface>(null);
  public config = this.loadService.config;
  public user = this.loadService.user;
  public executed = false;
  private mainBgType: BehaviorSubject<string> = new BehaviorSubject<string>('person');
  public mainBgType$ = this.mainBgType.asObservable();

  constructor(private http: HttpClient,
              private loadService: LoadService,
              private cookieService: CookieService) {
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

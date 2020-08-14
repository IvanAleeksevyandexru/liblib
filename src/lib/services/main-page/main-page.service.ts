import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { LoadService } from '../load/load.service';
import { MainPageContentInterface } from '../../models/main-page.model';
import { CookieService } from '../cookie/cookie.service';

@Injectable({
  providedIn: 'root'
})
export class MainPageService {

  public mainPageData = new BehaviorSubject<MainPageContentInterface>(null);
  public config = this.loadService.config;
  public executed = false;

  constructor(private http: HttpClient,
              private loadService: LoadService,
              private cookieService: CookieService) {
  }

  public getAll() {
    const params: { [key: string]: string } = {
      personType: 'PERSON',
      region: this.cookieService.get('userSelectedRegion') || '00000000000',
      _: Math.random().toString()
    };
    this.http.get<MainPageContentInterface>(this.config.cmsUrl + 'main', {
      withCredentials: true,
      params
    }).subscribe(res => {
      this.mainPageData.next(res);
    });
  }

}

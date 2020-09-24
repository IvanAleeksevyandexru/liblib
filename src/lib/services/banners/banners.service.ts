import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { BannerGroup } from '../../models/main-page.model';
import { tap } from 'rxjs/operators';
import { CookieService } from '../cookie/cookie.service';
import { YaMetricService } from '../ya-metric/ya-metric.service';

@Injectable({
  providedIn: 'root'
})
export class BannersService {

  public bannersData = new BehaviorSubject<BannerGroup[]>(null);
  public config = this.loadService.config;

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private cookieService: CookieService,
    public yaMetricService: YaMetricService
  ) {
  }

  public getBanners(bannerPlace: string, useRegion: boolean  = false): Observable<BannerGroup[]> {

    const params: { [key: string]: string } = {
      groups: bannerPlace,
      platform: 'EPGUV3_DESK',
      _: Math.random().toString()
    };
    if (useRegion) {
      params.region = this.cookieService.get('userSelectedRegion') || '00000000000';
    }
    return this.http.get<BannerGroup[]>(this.config.quadrupelUrl + 'banners', {
      withCredentials: true,
      params
    }).pipe(tap((data: BannerGroup[]) => this.setBanners(data)));
  }

  public closeBanner(bannerMnemonic: string): Observable<void> {
    return this.http.delete<void>(this.config.quadrupelUrl + 'banners/' + bannerMnemonic, {
      withCredentials: true
    }).pipe();
  }

  public closeStaticBanner(bannerMnemonic: string): void {
    let closedBanners = this.cookieService.get('closedBanners');

    closedBanners = closedBanners ? `${closedBanners},${bannerMnemonic}` : bannerMnemonic;
    this.cookieService.set('closedBanners', closedBanners);
  }

  public isStaticBannerClosed(bannerMnemonic: string): boolean {
    const closedBanners = this.cookieService.get('closedBanners');
    return closedBanners ? closedBanners.split(',').indexOf(bannerMnemonic) >= 0 : false;
  }

  public buildPath(bannerPlace: string, mnemonic: string): string {
    return bannerPlace + '.' + mnemonic;
  }

  public getMnemonic(bannerPath: string): string {
    return this.parseBannerPath(bannerPath)[1] || null;
  }

  public parseBannerPath(bannerPath: string): string[] {
    return bannerPath.split('.');
  }

  public setBanners(data: BannerGroup[]) {
    this.bannersData.next(data);
    this.yaMetricService.initBannerPlaceYaMetric(data);
  }

}

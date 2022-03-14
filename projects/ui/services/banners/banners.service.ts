import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { BannerGroup } from '@epgu/ui/models';
import { tap } from 'rxjs/operators';
import { CookieService } from '@epgu/ui/services/cookie';
import { YaMetricService } from '@epgu/ui/services/ya-metric';

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
      _: Math.random().toString(),
      groups: bannerPlace,
      platform: 'EPGUV3_DESK',
    };
    if (useRegion) {
      params.region = this.cookieService.get('userSelectedRegion') || '00000000000';
    }
    return this.http.get<BannerGroup[]>(this.config.quadrupelUrl + 'banners', {
      withCredentials: true,
      params
    }).pipe(tap((data: BannerGroup[]) => this.setBanners(data)));
  }

  public closeBanner(bannerMnemonic: string, bCode?: string): void {
    if (this.loadService?.user?.authorized) {
      let params = new HttpParams();
      if (bCode) {
        params = params.append('bCode', bCode);
      }
      this.http.delete<void>(this.config.quadrupelUrl + 'banners/' + bannerMnemonic, {
        withCredentials: true,
        params
      }).subscribe();
    } else if (bCode) {
      this.sendTargetBannersStatistic([bCode], 'CLOSE');
    }
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

  public getBannersBCodes(data: BannerGroup[]): string[] {
    const bCodes = [];
    if (data?.length) {
      data.forEach(group => {
        if (group.banners?.length) {
          group.banners.forEach(item => {
            if (item.bcode) {
              bCodes.push(item.bcode);
            }
          });
        }
      });
    }
    return bCodes;
  }

  public sendTargetBannersStatistic(bCodes: string[], evtType: 'VIEW' | 'CLICK' | 'CLOSE'): void {
    if (bCodes?.length) {
      this.http.get(`${this.loadService.config.quadrupelUrl}bstats`, {
        withCredentials: true,
        params: { bCodes: bCodes.toString(), evtType }
      }).subscribe();
    }
  }
}

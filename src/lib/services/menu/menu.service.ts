import { Injectable } from '@angular/core';
import { MenuLink } from '../../models/menu-link';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import { Category } from '../../models/category';
import { CookieService } from '../cookie/cookie.service';
import { AccessesService } from '../accesses/accesses.service';

const HASH = Math.random();

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
    private cookieService: CookieService,
    private accessesService: AccessesService,
  ) {
  }

  public loadCategories(): Promise<Category[]> {
    const attributes = this.loadService.attributes;
    const config = this.loadService.config;
    const params = new URLSearchParams();
    params.set('_', String(HASH));
    params.set('region', attributes.selectedRegion);
    params.set('platform', config.platform);
    params.set('userType', this.loadService.user.typeParams.catalogType);

    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.loadService.config.catalogApiUrl}categories/?${params}`)
        .toPromise()
        .then((data: Category[]) => {
          resolve(data);
        }, (err: any) => {
          reject();
        });
    });

  }

  public getLinks(): MenuLink[] {
    let links: MenuLink[] = [];

    const mainHost = this.loadService.config.betaUrl;
    let payHost = this.loadService.config.oplataUrl;
    if (!this.cookieService.get('pay-new')) {
      payHost = this.loadService.config.baseUrl;
    }

    switch (this.loadService.attributes.appContext) {
      case 'PARTNERS':
        if (this.accessesService.getAccessTech()) {
          if (this.accessesService.getAccess('ra')) {
            links.push({
              url: '/service-centers',
              title: 'HEADER.MENU.SERVICE_CENTERS'
            });
          }
          links.push({
            url: '/powers',
            title: 'HEADER.MENU.POWERS'
          });
          if (this.accessesService.getAccess('csg')) {
            links.push({
              url: '/access-groups',
              title: 'HEADER.MENU.ACCESS_GROUPS'
            });
          }
          links.push({
            url: '/systems',
            title: 'HEADER.MENU.SYSTEMS'
          });
        }
        break;
      case 'LK':
        links = [{
          url: `${mainHost}category`,
          title: 'HEADER.MENU.SERVICES',
          mnemonic: 'servises'
        }, {
          url: `${payHost}/pay`,
          title: 'HEADER.MENU.PAYMENT',
          mnemonic: 'defrayal'
        }, {
          url: `${mainHost}help`,
          title: 'HEADER.MENU.SUPPORT',
          mnemonic: 'support'
        }];

        if (this.loadService.user.isKid) {
          links.splice(0, 2);
        }

        break;
      case 'PAYMENT':
        links = [{
          url: `${mainHost}category`,
          title: 'HEADER.MENU.SERVICES'
        }, {
          url: '',
          title: 'HEADER.MENU.PAYMENT'
        }, {
          url: `${mainHost}help`,
          title: 'HEADER.MENU.SUPPORT'
        }];
        break;
      default:
        links = [{
          url: '/category',
          title: 'HEADER.MENU.SERVICES',
          listeners: true
        }, {
          url: '/pay',
          title: 'HEADER.MENU.PAYMENT'
        }, {
          url: '/help',
          title: 'HEADER.MENU.SUPPORT'
        }];
        break;
    }

    return links;
  }

  public getUserMenuLinks(): MenuLink[] {
    const links = this.getLinks();

    return links; // links.filter(link => link.title !== 'HEADER.MENU.PAYMENT');
  }

  public getStaticItemUrls(): object {
    const appContext = this.loadService.attributes.appContext;
    const lkUrl = appContext === 'LK' ? '/' : this.loadService.config.lkUrl;

    return {
      'HEADER.PERSONAL_AREA': `${lkUrl}overview`,
      'HEADER.MENU.SETTINGS': `${lkUrl}settings/account`,
      'HEADER.MENU.LOGIN_ORG': `${appContext === 'PARTNERS' ? '/' : lkUrl}roles`
    };
  }

}

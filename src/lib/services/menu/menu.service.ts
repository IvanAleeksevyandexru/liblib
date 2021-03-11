import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import { AccessesService } from '../accesses/accesses.service';
import { Category, MenuLink, User, UserRole } from '../../models';
import { CookieService } from '../cookie/cookie.service';

const HASH = Math.random();

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
    private accessesService: AccessesService,
    private cookieService: CookieService,
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
    const lkHost = this.loadService.config.urlLk;
    const payHost = this.loadService.config.oplataUrl;

    switch (this.loadService.attributes.appContext) {
      case 'PARTNERS':
        if (this.accessesService.getAccessTech()) {
          if (this.accessesService.getAccess('ra')) {
            links.push({
              url: '/service-centers',
              title: 'HEADER.MENU.SERVICE_CENTERS'
            });
          }
          if (this.cookieService.get('access_poweratt') === '1') {
            links.push({
              url: '/powers',
              title: 'HEADER.MENU.POWERS'
            });
          }
          // if (this.accessesService.getAccess('csg')) {
          links.push({
            url: '/access-groups',
            title: 'HEADER.MENU.ACCESS_GROUPS'
          });
          // }
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
          url: `${payHost}pay`,
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
      case 'PORTAL':
        if (this.loadService.user.authorized) {
          links = [{
            url: `${lkHost}orders/all`,
            title: 'HEADER.MENU.ORDERS',
            listeners: true
          }, {
            url: `${payHost}pay`,
            title: 'HEADER.MENU.PAYMENT'
          }, {
            url: `${lkHost}profile/personal`,
            title: 'HEADER.MENU.DOCS'
          }, {
            url: `${lkHost}messages`,
            title: 'HEADER.MENU.MESSAGES'
          }, {
            url: `${mainHost}category`,
            title: 'HEADER.MENU.SERVICES'
          }, {
            url: `${mainHost}help/news`,
            title: 'HEADER.MENU.BLOG'
          }, {
            url: `${lkHost}permissions`,
            title: 'HEADER.MENU.PERMISSIONS'
          }];
        } else {
          links = [{
            url: `${mainHost}category`,
            title: 'HEADER.MENU.SERVICES'
          }, {
            url: `${payHost}pay`,
            title: 'HEADER.MENU.PAYMENT'
          },  {
            url: `${mainHost}help/news`,
            title: 'HEADER.MENU.BLOG'
          }, {
            url: `${mainHost}help`,
            title: 'HEADER.MENU.HELP'
          }];
        }
        break;
      default:
        links = [{
          url: '/category',
          title: 'HEADER.MENU.SERVICES',
          listeners: true
        }, {
          url: `${payHost}pay`,
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
    const portalUrl = appContext === 'PORTAL' ? '/' : this.loadService.config.betaUrl;
    const payHost = appContext === 'PAYMENT' ? '/' : this.loadService.config.oplataUrl;

    return {
      'HEADER.PERSONAL_AREA': `${lkUrl}overview`,
      'HEADER.MENU.PROFILE': `${lkUrl}settings/account`,
      'HEADER.MENU.HELP': `${portalUrl}help`,
      'HEADER.MENU.NOTIFICATIONS': `${lkUrl}overview`,
      'HEADER.MENU.ORDERS': `${lkUrl}orders/all`,
      'HEADER.MENU.PAYMENT': `${payHost}pay`,
      'HEADER.MENU.DOCS': `${lkUrl}profile/personal`,
      'HEADER.MENU.PERMISSIONS': `${lkUrl}permissions`,
      'HEADER.MENU.SETTINGS': `${lkUrl}settings/account`,
      'HEADER.MENU.SETTINGS_MENU': `${lkUrl}settings/account`,
      'HEADER.MENU.LOGIN_ORG': `${appContext === 'PARTNERS' ? '/' : lkUrl}roles`
    };
  }

  public getUserRoles(user: User): UserRole[] {
    const betaUrl = this.loadService.attributes.appContext === 'PORTAL' ? '/' : this.loadService.config.betaUrl;
    const partnersUrl = this.loadService.config.partnersUrl;
    return [
      {
        name: 'Гражданам',
        url: `${betaUrl}`,
        code: 'P'
      },
      {
        name: 'Юридическим лицам',
        url: `${betaUrl}legal-entity`,
        code: 'L'
      },
      {
        name: 'Предпринимателям',
        url: `${betaUrl}entrepreneur`,
        code: 'B'
      },
      {
        name: 'Иностранным гражданам',
        url: `${betaUrl}foreign-citizen`,
        code: 'F'
      },
      {
        name: 'Партнёрам',
        url: `${partnersUrl}`,
        code: 'I'
      }
    ];
  }

}

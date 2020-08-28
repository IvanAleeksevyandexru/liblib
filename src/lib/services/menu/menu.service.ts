import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import { CookieService } from '../cookie/cookie.service';
import { Category, MenuLink, User } from '../../models';

const HASH = Math.random();

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
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
    let payHost = this.loadService.config.oplataUrl;
    if (!this.cookieService.get('pay-new')) {
      payHost = this.loadService.config.baseUrl;
    }

    switch (this.loadService.attributes.appContext) {
      case 'PARTNERS':
        links = [{
          url: '/catalog',
          title: 'HEADER.MENU.CATALOG'
        }, {
          url: '/news',
          title: 'HEADER.MENU.NEWS'
        }, {
          url: '/docs',
          title: 'HEADER.MENU.DOCS'
        }];
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
            url: `${lkHost}/orders/all`,
            title: 'HEADER.MENU.ORDERS',
            listeners: true
          }, {
            url: `${payHost}/pay`,
            title: 'HEADER.MENU.PAYMENT'
          }, {
            url: `${lkHost}/profile/personal`,
            title: 'HEADER.MENU.DOCS'
          }, {
            url: `${lkHost}/messages`,
            title: 'HEADER.MENU.MESSAGES'
          }, {
            url: `${mainHost}/category`,
            title: 'HEADER.MENU.SERVICES'
          }, {
            url: `${mainHost}/help/news`,
            title: 'HEADER.MENU.BLOG'
          }, {
            url: `${lkHost}/permissions`,
            title: 'HEADER.MENU.PERMISSIONS'
          }];
        } else {
          links = [{
            url: `${mainHost}/category`,
            title: 'HEADER.MENU.SERVICES'
          }, {
            url: `${payHost}/pay`,
            title: 'HEADER.MENU.PAYMENT'
          },  {
            url: `${mainHost}/help/news`,
            title: 'HEADER.MENU.BLOG'
          }, {
            url: `${mainHost}/help`,
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
    const lkUrl = this.loadService.attributes.appContext === 'LK' ? '/' : this.loadService.config.lkUrl;

    return {
      'HEADER.PERSONAL_AREA': `${lkUrl}overview`,
      'HEADER.MENU.SETTINGS': `${lkUrl}settings/account`,
      'HEADER.MENU.LOGIN_ORG': `${lkUrl}roles`
    };
  }

  public getUserRoles(user: User): any {
    const betaUrl = this.loadService.attributes.appContext === 'PORTAL' ? '/' : this.loadService.config.betaUrl;
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
      }
    ];
  }

}

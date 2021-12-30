import { Injectable } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Category, MenuLink, UserRole } from '@epgu/ui/models';
import { User } from '@epgu/ui/models/user';
import { AccessesService } from '@epgu/ui/services/accesses';
import { CookieService } from '@epgu/ui/services/cookie';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { HelperService } from '@epgu/ui/services/helper';
import { UserHelperService } from '@epgu/ui/services/user-helper';

const HASH = Math.random();

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  public closeBurgerOutside = new BehaviorSubject(false);
  public closeBurgerOutside$ = this.closeBurgerOutside.asObservable();
  public staticUrls: object;
  private viewType = this.loadService.attributes.appContext || this.loadService.config.viewType;

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
    private accessesService: AccessesService,
    private cookieService: CookieService,
    private yaMetricService: YaMetricService,
    private helperService: HelperService,
    private userHelper: UserHelperService
  ) {
    this.staticUrls = this.getStaticItemUrls();
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

  public getUserMenuDefaultLinks(): MenuLink[] {
    const links: MenuLink[] = [
      {
        title: 'HEADER.MENU.NOTIFICATIONS',
        mnemonic: 'overview', // правка изза выборов
        icon: 'bell'
      },
      {
        title: `HEADER.MENU.${this.userHelper.isIP ? 'BUSINESS' : 'ORG'}_PROFILE`,
        mnemonic: 'profile',
        icon: 'suitecase',
        showSeparatelyOnDesk: true,
        showCases: [this.userHelper.isUlIpOgv]
      },
      {
        title: `HEADER.MENU.ORDERS`,
        mnemonic: 'orders',
        icon: 'edit',
        showSeparatelyOnDesk: true
      },
      {
        title: 'HEADER.MENU.DOCS',
        mnemonic: 'docs',
        icon: 'doc',
        showSeparatelyOnDesk: true,
        showCases: [this.userHelper.isPerson]
      },
      {
        title: 'HEADER.MENU.PAYMENT',
        mnemonic: 'payment',
        icon: 'wallet',
        showSeparatelyOnDesk: true
      },
      {
        title: 'HEADER.MENU.PROFILE',
        mnemonic: 'profile',
        icon: 'person',
        showCases: [this.userHelper.isPerson]
      }
    ];
    return links.filter(l => !l.showCases || l.showCases.some(boo => boo));

  }

  public getStaticItemUrls(): object {
    const appContext = this.loadService.attributes.appContext;
    const lkUrl = appContext === 'LK' ? '/' : this.loadService.config.lkUrl;
    const portalUrl = appContext === 'PORTAL' ? '/' : this.loadService.config.betaUrl;
    const partnersHost = appContext === 'PARTNERS' ? '/' : this.loadService.config.partnersUrl;

    return {
      'HEADER.PERSONAL_AREA': `${lkUrl}overview`,
      'HEADER.MENU.PROFILE': `${lkUrl}settings/account`,
      'HEADER.MENU.HELP': `${portalUrl}help`,
      'HEADER.MENU.NOTIFICATIONS': `${lkUrl}overview`, // правка изза выборов
      'HEADER.MENU.ORDERS': `${lkUrl}orders`,
      'HEADER.MENU.PAYMENT': `${portalUrl}pay`,
      'HEADER.MENU.DOCS': `${lkUrl}profile`,
      'HEADER.MENU.AGREEMENTS': `${lkUrl}settings/third-party/agreements`,
      'HEADER.MENU.SETTINGS': `${lkUrl}settings/account`,
      'HEADER.MENU.SETTINGS_MENU': `${lkUrl}settings/account`,
      'HEADER.MENU.LOGIN_ORG': `${appContext === 'PARTNERS' ? '/' : lkUrl}roles`,
      'HEADER.MENU.SERVICE_CENTERS': `${partnersHost}service-centers`,
      'HEADER.MENU.POWERS': `${partnersHost}powers`,
      'HEADER.MENU.ACCESS_GROUPS': `${partnersHost}access-groups`,
      'HEADER.MENU.SYSTEMS': `${partnersHost}systems`,
      'HEADER.MENU.PARTNERS_ORDERS': `${partnersHost}lk/orders/all`,
      'HEADER.MENU.SUBSCRIPTIONS': `${partnersHost}lk/subscriptions`,
      'HEADER.MENU.HISTORY': `${partnersHost}lk/history`,
      'HEADER.MENU.ORG_PROFILE': `${lkUrl}org-profile`,
      'HEADER.MENU.BUSINESS_PROFILE': `${lkUrl}org-profile`,
    };
  }

  public getUserRoles(user: User): UserRole[] {
    const betaUrl = this.loadService.attributes.appContext === 'PORTAL' ? '/' : this.loadService.config.betaUrl;
    const partnersUrl = this.loadService.config.partnersUrl;
    return [
      {
        name: 'Гражданам',
        secondName: 'Граждан',
        url: `${betaUrl}`,
        code: 'P'
      },
      {
        name: 'Юридическим лицам',
        secondName: 'Юридическиx лиц',
        url: `${betaUrl}legal-entity`,
        code: 'L'
      },
      {
        name: 'Предпринимателям',
        secondName: 'Предпринимателей',
        url: `${betaUrl}entrepreneur`,
        code: 'B'
      },
      {
        name: 'Иностранным гражданам',
        secondName: 'Иностранных граждан',
        url: `${betaUrl}foreign-citizen`,
        code: 'F'
      },
      {
        name: 'Партнёрам',
        secondName: 'Партнёров',
        url: `${partnersUrl}`,
        code: 'I'
      }
    ];
  }

  public getUrl(menuItemName: string): string {
    return this.staticUrls[menuItemName] || '';
  }

  public menuItemClick(link: MenuLink): void {
    if (link.mnemonic === 'docs') {
      const goal = this.viewType === 'LK' ? 'todocuments_from_lk_' : 'todocuments_from_main_new_';
      this.yaMetricService.callReachGoal(goal,
        {
          type: this.loadService.attributes.deviceType,
        });
    }
    this.yaMetricService.callReachGoal('new_lk_dashboard',
      {
        type: this.loadService.attributes.deviceType,
        choice: link.mnemonic
      });
    if (link.handler) {
      link.handler(link);
    } else {
      this.helperService.navigate(link.url);
    }
  }

  public menuStaticItemClick(itemName: string, mnemonic): void {
    const staticUrl = this.getUrl(itemName);
    return this.menuItemClick({url: staticUrl, mnemonic} as MenuLink);
  }

}


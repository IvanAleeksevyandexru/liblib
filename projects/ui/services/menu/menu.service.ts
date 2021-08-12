import { Injectable } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Category, MenuLink, UserRole } from '@epgu/ui/models';
import { User } from '@epgu/ui/models/user';

const HASH = Math.random();

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  public closeBurgerOutside = new BehaviorSubject(false);
  public closeBurgerOutside$ = this.closeBurgerOutside.asObservable();

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
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

  public getUserMenuDefaultLinks(): MenuLink[] {
    return [{
      title: 'HEADER.MENU.NOTIFICATIONS',
      mnemonic: 'notifications',
      icon: 'bell'
    }, {
      title: 'HEADER.MENU.ORDERS',
      mnemonic: 'orders',
      icon: 'edit'
    }, {
      title: 'HEADER.MENU.PAYMENT',
      mnemonic: 'payment',
      icon: 'wallet'
    }, {
      title: 'HEADER.MENU.DOCS',
      mnemonic: 'docs',
      icon: 'doc'
    }, {
      title: 'HEADER.MENU.PERMISSIONS',
      mnemonic: 'permissions',
      icon: 'hand-break',
      trusted: true
    }].filter(item => {
      if (!item.trusted) {
        return true;
      }
      // Оставим пункты меню только для подтвержденной УЗ
      return this.loadService.user.person.person.trusted;
    }) as MenuLink[];
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
      'HEADER.MENU.NOTIFICATIONS': `${lkUrl}overview`,
      'HEADER.MENU.ORDERS': `${lkUrl}orders/all`,
      'HEADER.MENU.PAYMENT': `${portalUrl}pay`,
      'HEADER.MENU.DOCS': `${lkUrl}profile/personal`,
      'HEADER.MENU.PERMISSIONS': `${lkUrl}permissions`,
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

}

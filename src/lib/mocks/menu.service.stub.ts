import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import { MenuLink } from '../models/menu-link';

@Injectable()
export class MenuServiceStub {
  public loadCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      resolve([{
        id: 511183,
        code: 'passport',
        title: 'Паспорта, регистрации, визы',
        description: 'Гражданство и въезд в РФ, регистрация граждан',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/7.svg', iconType: 'small' }]
      }, {
        id: 511184,
        code: 'transport',
        title: 'Транспорт и вождение',
        description: 'Автомобильный, водный и воздушный транспорт',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/11.svg', iconType: 'small' }]
      }, {
        id: 511185,
        code: 'learning',
        title: 'Образование',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/56.svg', iconType: 'small' }]
      }, {
        id: 511187,
        code: 'health',
        title: 'Моё здоровье',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/22.svg', iconType: 'small' }]
      }, {
        id: 511188,
        code: 'pensions',
        title: 'Пенсия, пособия и льготы',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/26.svg', iconType: 'small' }],
      }, {
        id: 511189,
        code: 'license',
        title: 'Лицензии, справки, аккредитации',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/29.svg', iconType: 'small' }],
      }, {
        id: 511190,
        code: 'property',
        title: 'Квартира, строительство и земля',
        description: 'test test',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/33.svg', iconType: 'small' }]
      }, {
        id: 511191,
        code: 'business',
        title: 'Бизнес, предпринимательство, НКО',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/34.svg', iconType: 'small' }],
      }, {
        id: 511192,
        code: 'job',
        title: 'Работа и занятость',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/38.svg', iconType: 'small' }],
      }, {
        id: 511186,
        code: 'taxes',
        title: 'Налоги и финансы',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/16.svg', iconType: 'small' }],
      }, {
        id: 511196,
        code: 'communication',
        title: 'Информация, связь и реклама',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/49.svg', iconType: 'small' }],
      }, {
        id: 511197,
        code: 'nature',
        title: 'Природопользование и экология',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/55.svg', iconType: 'small' }],
      }, {
        id: 511529,
        code: 'test00001',
        title: 'Тестовая категория 00001',
      }, {
        id: 511182,
        code: 'family',
        title: 'Семья и дети',
        description: 'Брак, материнство, льготы многодетным семьям',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/3.svg', iconType: 'small' }],
      }, {
        id: 511195,
        code: 'production',
        title: 'Производство и торговля',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/46.svg', iconType: 'small' }],
      }, {
        id: 511193,
        code: 'culture',
        title: 'Культура, досуг, спорт',
        icons: [{ path: 'https://static.gosuslugi.ru/content/catalog/pas/41.svg', iconType: 'small' }]
      }, {
        id: 536434,
        code: 'personCategory',
        title: 'АТ Категория',
        description: 'Тестовая категория'
      }]);
    });
  }

  public getLinks(): MenuLink[] {
    return [{
      url: '/category',
      title: 'Услуги',
      listeners: true
    }, {
      url: '/pay',
      title: 'Оплата'
    }, {
      url: '/help',
      title: 'Поддержка'
    }];
  }

  public getUserMenuDefaultLinks(): MenuLink[] {
    return this.getLinks();
  }

  public getStaticItemUrls(): object {
    const lkUrl = '/';

    return {
      'HEADER.PERSONAL_AREA': `${lkUrl}overview`,
      'HEADER.MENU.SETTINGS': `${lkUrl}settings`,
      'HEADER.MENU.LOGIN_ORG': `${lkUrl}roles`
    };
  }

}

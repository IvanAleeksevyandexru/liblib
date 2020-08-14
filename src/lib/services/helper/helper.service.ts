import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { AccountEvent, AccountEvents, AccountEventType} from '../../models/account-event';
import { FileLink } from '../../models/file-link';
import { DadataResult } from '../../models/dadata';
import { Address } from '../../models/address';
import { LoadService } from '../load/load.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() {
  }

  public static isTouchDevice() {
    return 'ontouchstart' in window;
  }

  public static isPad() {
    const isPortrait = !window.screen || window.screen.orientation && window.screen.orientation.type.startsWith('portrait');
    return HelperService.isTouchDevice() && (isPortrait ? window.outerWidth >= 768 : window.outerHeight >= 768);
  }

  public static isMobile() {
    return HelperService.isTouchDevice() && !HelperService.isPad();
  }

  public static getPlatform(returnType = 1) {
    const isDesktop = !HelperService.isTouchDevice();
    const isPad = HelperService.isPad();
    const isMobile = !isDesktop && !isPad;
    switch (returnType) {
      case 1: {
        return isDesktop ? 'EPGU_V3' : (isPad ? 'TABLET_EPGU_V3' : 'MOBILE_EPGU_V3');
      }
      case 2:
      default: {
        return isDesktop ? 'EPGUV3_DESK' : (isPad ? 'EPGUV3_TAB' : 'EPGUV3_MOB');
      }
    }
  }

  public static isSafari() {
    return new RegExp('^((?!chrome|android).)*safari', 'i').test(navigator.userAgent);
  }

  public static isIE() {
    return !((window as any).ActiveXObject) && 'ActiveXObject' in window;
  }

  public static isString(something: any) {
    return typeof something === 'string' || something instanceof String;
  }

  public static isObject(something: any) {
    if (something === null || something === undefined) {
      return false;
    }
    return (typeof something === 'function') || (typeof something === 'object');
  }

  public static isArray(something: any) {
    return Array.isArray(something);
  }

  public static isIterable(something: any, strict?: boolean) {
    if (something === null || something === undefined) {
      return false;
    }
    if (strict) {
      return typeof something[Symbol.iterator] === 'function';
    } else {
      return typeof something[Symbol.iterator] === 'function' || HelperService.isObject(something);
    }
  }

  public static isEmpty(something: any) {
    if (!HelperService.isIterable(something)) {
      return false;
    }
    if (HelperService.isIterable(something, true)) {
      for (const i of Object.keys(something)) {
        return false;
      }
    }
    return true;
  }

  public static keys(something: any) {
    if (!HelperService.isObject(something)) {
      return [];
    }
    return Object.keys(something);
  }

  public static values(something: any) {
    if (!HelperService.isObject(something)) {
      return [];
    }
    return Object.values(something);
  }

  public static deepCopy(obj: any) {
    let newObj = obj;  // default case for most types
    if (obj && typeof obj === 'object') {
      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }
      newObj = Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
      for (const i of Object.keys(obj)) {
        newObj[i] = this.deepCopy(obj[i]);
      }
    }
    return newObj;
  }

  public static toCamelCase(str: string): string {
    const splitted = str ? str.split(/[\s_]+/) : [];
    return splitted.map((word, index) => {
      return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  public static htmlToText(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body ? doc.body.textContent : '';
  }

  public static resetSelection(inputElement: HTMLInputElement, mask: string = null) {
    if (!inputElement || !(inputElement.type === 'text' || inputElement.type === 'password')) {
      return;
    }
    const value = inputElement.value;
    let lastCharacterPosition = (value || '').length;
    if (mask && value) {
      for (let i = mask.length; i--; i >= 0) {
        if (i >= value.length) {
          continue;
        }
        if (mask[i] === value[i]) {
          lastCharacterPosition--;
        } else {
          break;
        }
      }
    }
    inputElement.setSelectionRange(lastCharacterPosition, lastCharacterPosition);
  }

  public static mixinModuleTranslations(moduleTranslationService: TranslateService) {
    // triggers translation service to load and append module translation to main
    const translate = moduleTranslationService;
    const mixin = () => {
      const existingTranslations = translate.translations[translate.currentLang];
      translate.getTranslation(translate.currentLang).subscribe((res) => { // rewrites main translations with module ones
        translate.setTranslation(translate.currentLang, existingTranslations, true); // recovers main translations
        translate.setTranslation(translate.currentLang, res, true); // appends module's and emits changes
      });
    };
    translate.onLangChange.subscribe((info) => mixin());
    translate.onDefaultLangChange.subscribe((info) => mixin());
    mixin();
  }

  public static convertEpguDadataAddressToEsiaAddress(dadataAddress: DadataResult, type: 'PLV' | 'PRG' | 'OPS' | 'OLG'): Address {
    return {
      type,
      countryId: 'RUS',
      addressStr: dadataAddress.addressStr,
      zipCode: dadataAddress.index,
      fiasCode: dadataAddress.fiasCode,
      region: dadataAddress.region, // 1 - регион/область
      area: dadataAddress.district, // 3 - район
      city: dadataAddress.city, // 4 - город
      district: dadataAddress.inCityDist, // 5 - внутригородской район
      settlement: dadataAddress.town, // 6 - населенный пункт
      additionArea: dadataAddress.additionalArea, // 90 - дополнительная территория
      additionAreaStreet: dadataAddress.additionalStreet, // 91 - улица на дополнительной территории
      street: dadataAddress.street, // 7 - улица
      house: dadataAddress.house, // дом
      frame: dadataAddress.building1, // корпус
      building: dadataAddress.building2, // строение
      flat: dadataAddress.apartment // квартира
    };
  }

  public static formatAddress(address: Address): string {
    if (!address.id) {
      return '';
    }
    const addrArr: string[] = [];
    ['zipCode', 'addressStr', 'house', 'building', 'frame', 'flat'].forEach(item => {
      if (!!address[item]) {
        let prefix = '';
        switch (item) {
          case 'house':
            prefix = 'д. ';
            break;
          case 'building':
            prefix = 'стр. ';
            break;
          case 'frame':
            prefix = 'корп. ';
            break;
          case 'flat':
            prefix = 'кв. ';
            break;
          default:
            break;
        }
        addrArr.push(prefix + address[item]);
      }
    });
    return addrArr.length ? addrArr.join(', ') : '';
  }

  public static formatMailDelivery(address: any): string {
    let resultStr = '';
    const orderedModel = ['region', 'area', 'city', 'cityArea', 'place', 'street',
      'additionalArea', 'additionalStreet', 'house', 'building1', 'building2', 'apartment', 'post_index'
    ];
    const mapping = {
      region: 'region',
      area: 'district',
      city: 'city',
      place: 'locality',
      street: 'street',
      cityArea: 'ownership',
      house: 'house',
      building1: 'housing',
      building2: 'building',
      apartment: 'apartment'
    };

    orderedModel.forEach(addr => {
      if (address[mapping[addr]] && (addr !== 'post_index')) {
        if (!(addr === 'region' && address.region === address.city)) {
          resultStr += addr !== 'house' ? ', ' : ', д. ';
          resultStr += address[mapping[addr]].trim();
        }
      }
    });

    const index = address.postalCode || address.post_index || address.zipCode;
    if (index && index.length) {
      resultStr = index + resultStr;
    }
    return resultStr;
  }

  public static resizeMasonryItem(item): void {
    /* Get the grid object, its row-gap, and the size of its implicit rows */
    const grid = document.getElementsByClassName('masonry')[0];
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'), 10) || 16;
    /*
     * Spanning for any brick = S
     * Grid's row-gap = G
     * Size of grid's implicitly create row-track = R
     * Height of item content = H
     * Net height of the item = H1 = H + G
     * Net height of the implicit row-track = T = G + R
     * S = H1 / T
     */
    const rowSpan = item.querySelector('.info-card')
      && Math.ceil((item.querySelector('.info-card').getBoundingClientRect().height + rowGap) / (rowGap));

    /* Set the spanning as calculated above (S) */
    item.style.gridRowEnd = 'span ' + rowSpan;
    item.style.msGridRow = rowSpan;
  }

  public static resizeAllMasonryItems() {
    // Get all item class objects in one list
    const allItems = document.getElementsByClassName('masonry-brick');

    /*
     * Loop through the above list and execute the spanning function to
     * each list-item (i.e. each masonry item)
     */
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < allItems.length; i++) {
      HelperService.resizeMasonryItem(allItems[i]);
    }
  }

  public static createStorageLink(storageUrl: string, file: FileLink) {
    return `${storageUrl}files/${file.objectId}/${file.objectTypeId}/download?mnemonic=${file.mnemonic}`;
  }

  public static setRequestOptions(
    token?: string,
    extra?: {
      headers?: { name: string, value: string | string[] }[],
      options?: any
    }
  ): any {
    let headers: HttpHeaders = new HttpHeaders();

    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Cache-Control', 'no-cache');

    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    if (extra && extra.headers && extra.headers.length > 0) {
      extra.headers.forEach((header) => {
        if (header.value !== '') {
          if (headers.has(header.name)) {
            headers = headers.set(header.name, header.value);
          } else {
            headers = headers.append(header.name, header.value);
          }
        } else {
          headers = headers.delete(header.name);
        }
      });
    }

    const options = extra && extra.options ? extra.options : {};

    return {
      headers,
      withCredentials: true,
      ...options
    };
  }

  public static removeLastSlash(str) {
    if (!str) {
      return '';
    }
    return str.endsWith('/') ? str.slice(0, -1) : str;
  }

}

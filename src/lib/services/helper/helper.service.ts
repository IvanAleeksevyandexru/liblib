import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountEvent, AccountEvents, AccountEventType} from '../../models/account-event';
import { FileLink } from '../../models/file-link';
import { DadataResult } from '../../models/dadata';
import { Address } from '../../models/address';
import { LoadService } from '../load/load.service';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private router: Router) {
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

  public static createEvent(eventType: string, bubbles: boolean, cancelable: boolean) {
    if (HelperService.isIE()) {
      const evt = document.createEvent('Event');
      evt.initEvent(eventType, bubbles, cancelable);
      return evt;
    } else {
      return new Event(eventType, {bubbles, cancelable});
    }
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

  public static isFunction(something: any) {
    return typeof something === 'function' || something instanceof Function;
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

  // простое глубокое копирование, подходит для json-образных структур где конструкторы/типы объектов не имеют значения
  public static deepCopy(obj: any) {
    let newObj = obj;  // все простые типы копируются как есть
    if (obj && typeof obj === 'object') {
      if (obj instanceof Date) {
        return new Date(obj.getTime()); // даты клонируем, т.к. они mutable
      }
      newObj = Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
      for (const i of Object.keys(obj)) {
        newObj[i] = this.deepCopy(obj[i]);
      }
    }
    return newObj;
  }

  public static copyArrayToArray(source: Array<any>, dest: Array<any>): void {
    if (!dest) {
      return;
    }
    const sourceX = source || [];
    const originalLength = dest.length;
    sourceX.forEach((item: any, index: number) => {
      dest[index] = source[index];
    });
    if (originalLength > sourceX.length) {
      dest.splice(sourceX.length, originalLength - sourceX.length);
    }
  }

  // преобразует cebab-case, snake-case и обычный текст разделенный пробелами в camelCase
  public static toCamelCase(str: string): string {
    const splitted = str ? str.split(/[\s_\-]+/) : [];
    return splitted.map((word, index) => {
      return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  // конвертирует хтмл в его текстовое представление, убирает все теги
  public static htmlToText(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body ? doc.body.textContent : '';
  }

  // определяет затрагивает ли позиция курсора в пользовательском тексте верстку
  public static isTextPosition(html: string, positionFrom: number, positionTo) {
    let isText = true;
    for (let i = 0; i < positionTo; i++) {
      if (html[i] === '<') {
        isText = false;
      }
      if (i >= positionFrom && i < positionTo && !isText) {
        return false;
      }
      if (html[i] === '>') {
        isText = true;
      }
    }
    return true;
  }

  // ставит курсор ввода на конец текста в текстовом элементе, при этом убирает выделение
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

  // выделяет все найденные подстроки в хтмл, предохраняя кейс оригинала: ("foUnd FoUnd", "found") -> <b>foUnd</b> <b>FoUnd</b>
  public static highlightSubstring(html: string, highlighQuery: string, caseSensitive: boolean,
                                   fromStartOnly: boolean, template = ConstantsService.DEFAULT_HIGHLIGHT_TEMPLATE) {
    if (!highlighQuery) {
      return html;
    }
    let line = html;
    const pattern = new RegExp('(' + (fromStartOnly ? '^' : '') + highlighQuery + ')', caseSensitive ? 'g' : 'gi');
    const matches = [];
    let match;
    do {
      match = pattern.exec(line);
      if (match) {
        matches.push(match);
      }
    } while (match);
    matches.sort((matchA, matchB) => {
      return matchB.index - matchA.index;
    });
    for (const foundMatch of matches) {
      if (HelperService.isTextPosition(line, foundMatch.index, foundMatch.index + highlighQuery.length)) {
        line =
          line.substring(0, foundMatch.index) + template.replace(/\$\{query\}/, foundMatch[0]) +
          line.substring(foundMatch.index + highlighQuery.length);
      }
    }
    return line;
  }

  // проверяет захватило ли выделение целиком всю строку от начала до конца
  public static isAllHighlighted(highlighResult: string, html: string, template = ConstantsService.DEFAULT_HIGHLIGHT_TEMPLATE) {
    return highlighResult === template.replace(/\$\{query\}/, html);
  }

  // процент видимости элемента в контейнере
  public static getVisibilityExtent(el: HTMLElement, container: HTMLElement): number {
    if (container.contains(el) && el.getBoundingClientRect && container.getBoundingClientRect) {
      const clientRect = el.getBoundingClientRect();
      const hostRect = container.getBoundingClientRect();
      if (clientRect.right < hostRect.left || clientRect.left > hostRect.right ||
          clientRect.top > hostRect.bottom || clientRect.bottom < hostRect.top) {
        return 0;
      }
      const xStart = Math.max(hostRect.left, clientRect.left);
      const xEnd = Math.min(hostRect.right, clientRect.right);
      const yStart = Math.max(hostRect.top, clientRect.top);
      const yEnd = Math.min(hostRect.bottom, clientRect.bottom);
      return ((xEnd - xStart) * (yEnd - yStart)) / (clientRect.height * clientRect.width);
    } else {
      return 0;
    }
  }

  // определяет отступы от края контейнера где по факту начинается контент
  public static getContainerIndent(container: HTMLElement) {
    const probeElement = document.createElement('div');
    probeElement.style.cssText = 'position: absolute; left: unset; top: unset;';
    container.insertBefore(probeElement, container.firstChild);
    const clientRect = probeElement.getBoundingClientRect();
    const hostRect = container.getBoundingClientRect();
    const leftIndent = clientRect.left - hostRect.left;
    const upperIndent = clientRect.top - hostRect.top;
    container.removeChild(probeElement);
    return {left: leftIndent, top: upperIndent};
  }

  // форсирует "подмешивание" переводов модуля к имеющемуся словарю языка
  public static mixinModuleTranslations(moduleTranslationService: TranslateService) {
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

  public static markFormTouched(form: FormGroup) {
    const controls = form.controls;
    for (const controlName of Object.keys(controls)) {
      controls[controlName].markAsTouched({onlySelf: false});
    }
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

  public static getQueryParams(absoluteUrl: string): {[key: string]: string} {
    const result = {};
    const url = new URL(absoluteUrl);
    url.searchParams.forEach((value: string, name: string) => {
      result[name] = value;
    });
    return result;
  }

  public static appendQueryParams(absoluteUrl: string, queryParams?: {[key: string]: string}): string {
    let url = absoluteUrl;
    if (queryParams) {
      const params = Object.keys(queryParams).map((key: string) =>
        key + '=' + encodeURIComponent(queryParams[key] || '')).join('&');
      url = url.includes('?') ? url + '&' + params : url + '?' + params;
    }
    return url;
  }

  public static recoverProtocol(url: string) {
    return url && url.startsWith('//') ? window.location.protocol + ':' + url : url;
  }

  public static relativeUrlToAbsolute(relativeUrl: string): string {
    const link = document.createElement('a');
    link.href = relativeUrl;
    return link.protocol + '//' + link.host + link.pathname;
  }

  public static getCurrentHost(): string {
    return window.location.protocol + '//' + window.location.host;
  }

  public static isRelativeUrl(url: string): boolean {
    return url && (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) && !url.startsWith('//');
  }

  public static isInternalUrl(url: string): boolean {
    return url && HelperService.recoverProtocol(url).startsWith(HelperService.getCurrentHost());
  }

  public static internalUrlToRelative(url: string): string {
    return url && HelperService.isInternalUrl(url) ?
      HelperService.recoverProtocol(url).substring(HelperService.getCurrentHost().length) || '/' : url;
  }

  public static isUrlEqualToCurrent(url: string | {url: string, queryParams?: {[key: string]: string}}) {
    const urlIsCompound = HelperService.isObject(url);
    const baseUrl = url && urlIsCompound ? (url as any).url : url;
    const compoundQueryParams = urlIsCompound ? (url as any).queryParams : null;
    const absUrl = HelperService.relativeUrlToAbsolute(baseUrl);
    const basePartEqual = absUrl === HelperService.getCurrentHost() + window.location.pathname;
    const urlQueryParams = Object.assign(HelperService.getQueryParams(absUrl), urlIsCompound ? compoundQueryParams : {});
    const currentUrlQueryParams = HelperService.getQueryParams(window.location.href);
    if (Object.keys(urlQueryParams).length === Object.keys(currentUrlQueryParams).length) {
      return basePartEqual && Object.keys(urlQueryParams).every((key: string) => urlQueryParams[key] === currentUrlQueryParams[key]);
    } else {
      return false;
    }
  }

  // queryParams игнорятся! сравнивается только контекст
  public static isUrlStartsAsCurrent(url: string | {url: string, queryParams?: {[key: string]: string}}) {
    const urlIsCompound = HelperService.isObject(url);
    const baseUrl = url && urlIsCompound ? (url as any).url : url;
    const givenUrl = HelperService.relativeUrlToAbsolute(baseUrl);
    return window.location.href.startsWith(givenUrl);
  }

  // переходит по ссылке (относительной или абсолютной) структурированной как объект или как строка
  // предпочитает router для всех внутренних переходов (относительных или абсолютных) и location.href для внешних
  public navigate(url: string | {url: string, queryParams?: {[key: string]: string}}, newTab = false) {
    if (!url) {
      return;
    }
    const urlIsCompound = HelperService.isObject(url);
    const baseUrl = url && urlIsCompound ? (url as any).url : url;
    const compoundQueryParams = urlIsCompound ? (url as any).queryParams : null;
    if (HelperService.isRelativeUrl(baseUrl)) {
      if (newTab) {
        const absoluteBaseUrl = HelperService.relativeUrlToAbsolute(baseUrl);
        const absoluteUrl = HelperService.appendQueryParams(absoluteBaseUrl, compoundQueryParams);
        window.open(absoluteUrl);
      } else {
        this.router.navigate([baseUrl], urlIsCompound ? {queryParams: compoundQueryParams} : {});
      }
    } else {
      if (HelperService.isInternalUrl(baseUrl) && !newTab) {
        const relativeUrl = HelperService.internalUrlToRelative(baseUrl);
        this.router.navigateByUrl(relativeUrl, urlIsCompound ? {queryParams: compoundQueryParams} : {});
      } else {
        const absoluteUrl = HelperService.appendQueryParams(baseUrl, compoundQueryParams);
        if (newTab) {
          window.open(absoluteUrl);
        } else {
          window.location.href = absoluteUrl;
        }
      }
    }
  }

}

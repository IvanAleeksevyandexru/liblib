import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsService } from '@epgu/ui/services/constants';
import { Address, DadataResult, FileLink, IHttpOptions } from '@epgu/ui/models';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private reloadAbsoluteInternalLinks = false;
  private deviceType: 'mob' | 'desk' | 'tab' = null;

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

  public static isIos() {
    return new RegExp('iPhone|iPad|iPod').test(navigator.userAgent);
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
      return new Event(eventType, { bubbles, cancelable });
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

  // ?????????????? ???????????????? ??????????????????????, ???????????????? ?????? json-???????????????? ???????????????? ?????? ????????????????????????/???????? ???????????????? ???? ?????????? ????????????????
  public static deepCopy(obj: any) {
    let newObj = obj;  // ?????? ?????????????? ???????? ???????????????????? ?????? ????????
    if (obj && typeof obj === 'object') {
      if (obj instanceof Date) {
        return new Date(obj.getTime()); // ???????? ??????????????????, ??.??. ?????? mutable
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

  // ?????????????????????? cebab-case, snake-case ?? ?????????????? ?????????? ?????????????????????? ?????????????????? ?? camelCase
  public static toCamelCase(str: string): string {
    const splitted = str ? str.split(/[\s_\-]+/) : [];
    return splitted.map((word, index) => {
      return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  // ???????????????????????? ???????? ?? ?????? ?????????????????? ??????????????????????????, ?????????????? ?????? ????????
  public static htmlToText(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body ? doc.body.textContent : '';
  }

  // ???????????????? ?????????????????? ???????????????????????????????? ?? ?????????????????????? ???? ????????????????????, ???????????? pluralizeNouns ???????????? ?????????? 3!
  public static pluralize(quanity: number, pluralizeNouns: Array<string>): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return pluralizeNouns[(quanity % 100 > 4 && quanity % 100 < 20) ? 2 : cases[(quanity % 10 < 5) ? quanity % 10 : 5]];
  }

  // ???????????????????? ?????????????????????? ???? ?????????????? ?????????????? ?? ???????????????????????????????? ???????????? ??????????????
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

  public static findMatchEnd(text: string, mask: string): number {
    const value = text || '';
    let matchEnd = (value || '').length;
    if (mask && value) {
      for (let i = mask.length; i--; i >= 0) {
        if (i >= value.length) {
          continue;
        }
        if (mask[i] === value[i]) {
          matchEnd--;
        } else {
          break;
        }
      }
    }
    return matchEnd;
  }

  // ???????????? ???????????? ?????????? ???? ?????????? ???????????? ?? ?????????????????? ????????????????, ?????? ???????? ?????????????? ??????????????????
  public static resetSelection(inputElement: HTMLInputElement, mask: string = null, startPosition?: number) {
    if (!inputElement || !(inputElement.type === 'text' || inputElement.type === 'password')) {
      return;
    }
    const lastCharacterPosition = HelperService.findMatchEnd(inputElement.value, mask);
    const indexOfCaret = startPosition && startPosition > lastCharacterPosition ? startPosition : lastCharacterPosition;
    inputElement.setSelectionRange(indexOfCaret, indexOfCaret);
  }

  // ???????????????? ?????? ?????????????????? ?????????????????? ?? ????????, ?????????????????????? ???????? ??????????????????: ("foUnd FoUnd", "found") -> <b>foUnd</b> <b>FoUnd</b>
  public static highlightSubstring(html: string, highlighQuery: string, caseSensitive: boolean,
    fromStartOnly: boolean, template = ConstantsService.DEFAULT_HIGHLIGHT_TEMPLATE) {
    if (!highlighQuery) {
      return html;
    }
    let line = html;
    const query = highlighQuery.replace(/\(/g, '\\(',).replace(/\)/g, '\\)');
    const pattern = new RegExp('(' + (fromStartOnly ? '^' : '') + query + ')', caseSensitive ? 'g' : 'gi');
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

  // ?????????????????? ?????????????????? ???? ?????????????????? ?????????????? ?????? ???????????? ???? ???????????? ???? ??????????
  public static isAllHighlighted(highlighResult: string, html: string, template = ConstantsService.DEFAULT_HIGHLIGHT_TEMPLATE) {
    return highlighResult === template.replace(/\$\{query\}/, html);
  }

  // ?????????????? ?????????????????? ???????????????? ?? ????????????????????
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

  // ???????????????????? ?????????????? ???? ???????? ???????????????????? ?????? ???? ?????????? ???????????????????? ??????????????
  public static getContainerIndent(container: HTMLElement) {
    const probeElement = document.createElement('div');
    probeElement.style.cssText = 'position: absolute; left: unset; top: unset;';
    container.insertBefore(probeElement, container.firstChild);
    const clientRect = probeElement.getBoundingClientRect();
    const hostRect = container.getBoundingClientRect();
    const leftIndent = clientRect.left - hostRect.left;
    const upperIndent = clientRect.top - hostRect.top;
    container.removeChild(probeElement);
    return { left: leftIndent, top: upperIndent };
  }

  // ?????????????????? "????????????????????????" ?????????????????? ???????????? ?? ???????????????????? ?????????????? ??????????
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
      controls[controlName].markAsTouched({ onlySelf: false });
    }
  }

  public static convertEpguDadataAddressToEsiaAddress(dadataAddress: DadataResult, type: 'PLV' | 'PRG' | 'OPS' | 'OLG' | 'PTA'): Address {
    const address: Address = {
      type,
      countryId: 'RUS',
      addressStr: dadataAddress.addressStr,
      zipCode: dadataAddress.index,
      fiasCode: dadataAddress.fiasCode,
      region: dadataAddress.region, // 1 - ????????????/??????????????
      area: dadataAddress.district, // 3 - ??????????
      city: dadataAddress.city, // 4 - ??????????
      district: dadataAddress.inCityDist, // 5 - ?????????????????????????????? ??????????
      settlement: dadataAddress.town, // 6 - ???????????????????? ??????????
      additionArea: dadataAddress.additionalArea, // 90 - ???????????????????????????? ????????????????????
      additionAreaStreet: dadataAddress.additionalStreet, // 91 - ?????????? ???? ???????????????????????????? ????????????????????
      street: dadataAddress.street, // 7 - ??????????
      house: dadataAddress.house, // ??????
      frame: dadataAddress.building1, // ????????????
      building: dadataAddress.building2, // ????????????????
      flat: dadataAddress.apartment // ????????????????
    };
    if (dadataAddress.hasOwnProperty('house')) {
      address.houseType = dadataAddress.houseShortType;
      address.houseTypeFull = dadataAddress.houseType;
    }
    if (dadataAddress.hasOwnProperty('building1')) {
      address.frameType = dadataAddress.building1ShortType;
      address.frameTypeFull = dadataAddress.building1Type;
    }
    return address;
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
            prefix = address.hasOwnProperty('houseType') ? `${address.houseType}. ` : '??. ';
            break;
          case 'building':
            prefix = '??????. ';
            break;
          case 'frame':
            prefix = address.hasOwnProperty('frameType') ? `${address.frameType}. ` : '????????. ';
            break;
          case 'flat':
            prefix = '????. ';
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
      'additionalArea', 'additionalStreet', 'house', 'building1', 'building2', 'frame', 'apartment', 'flat', 'post_index'
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
      frame: 'frame',
      apartment: 'apartment',
      flat: 'flat'
    };

    orderedModel.forEach(addr => {
      if (address[mapping[addr]] && (addr !== 'post_index')) {
        if (!(addr === 'region' && address.region === address.city)) {
          resultStr += addr === 'house' ? ', ??. ' : addr === 'flat' ? ', ????. ' : '';
          resultStr += addr === 'frame' ? ', ????????. ' : addr === 'building2' ? ', c????. ' : '';
          if (addr !== 'house' && addr !== 'flat' && addr !== 'frame' && addr !== 'building2') {
            resultStr += ', ';
          }
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
  ): IHttpOptions {
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

  public static getQueryParams(absoluteUrl: string): { [key: string]: string } {
    const result = {};
    const url = new URL(absoluteUrl);
    url.searchParams.forEach((value: string, name: string) => {
      result[name] = value;
    });
    return result;
  }

  public static appendQueryParams(absoluteUrl: string, queryParams?: { [key: string]: string }): string {
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

  public static langIsRus(lang: string): boolean {
    return lang === 'ru';
  }

  public static isUrlEqualToCurrent(url: string | { url: string, queryParams?: { [key: string]: string } }) {
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

  // queryParams ??????????????????! ???????????????????????? ???????????? ????????????????
  public static isUrlStartsAsCurrent(url: string | { url: string, queryParams?: { [key: string]: string } }) {
    const urlIsCompound = HelperService.isObject(url);
    const baseUrl = url && urlIsCompound ? (url as any).url : url;
    const givenUrl = HelperService.relativeUrlToAbsolute(baseUrl);
    return window.location.href.startsWith(givenUrl);
  }

  // ?????????? ???????????????????? ?? ?????????? data
  public static toClipboard(data: any, successCallback = () => {
  }): void {
    const listener = (e: ClipboardEvent) => {
      const clipboard = e.clipboardData || (window as any).clipboardData;
      clipboard.setData('text', data);
      successCallback();
      e.preventDefault();
    };
    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);
  }

  // ?????????????????? ???? ???????????? (?????????????????????????? ?????? ????????????????????) ?????????????????????????????????? ?????? ???????????? ?????? ?????? ????????????
  // ???????????????????????? router ?????? ???????? ???????????????????? ?????????????????? (?????????????????????????? ?????? ????????????????????) ?? location.href ?????? ??????????????
  public navigate(url: string | { url: string, queryParams?: { [key: string]: string } }, newTab = false) {
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
        this.router.navigate([baseUrl], urlIsCompound ? { queryParams: compoundQueryParams } : {});
      }
    } else {
      // TODO: need to change logic - internal host link cannot be a part of an application
      if (HelperService.isInternalUrl(baseUrl) && !newTab && !this.reloadAbsoluteInternalLinks) {
        const relativeUrl = HelperService.internalUrlToRelative(baseUrl);
        this.router.navigateByUrl(
          this.router.createUrlTree(
            [relativeUrl], urlIsCompound ? { queryParams: compoundQueryParams } : {}
          ));
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

  public setReloadAbsoluteInternalLinks(value: boolean): void {
    this.reloadAbsoluteInternalLinks = value;
  }

  public set deviceTypeParam(type: 'mob' | 'desk' | 'tab') {
    this.deviceType = type
  }

  public get deviceTypeParam(): 'mob' | 'desk' | 'tab' {
    return this.deviceType;
  }
  /**
 * ???????????????? ???? ???????????????????????? ????????????????.
 */
  public static deepEqual(object1: any, object2: any): boolean {
    if (object1 == null || object2 == null) {
      return object2 === object1;
    }
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = HelperService.isObject(val1) && HelperService.isObject(val2);
      if (
        (areObjects && !HelperService.deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  }

  public static isMpWebView(): boolean {
    const userAgent = window.navigator.userAgent;
    return ConstantsService.MP_USER_AGENTS.findIndex(item => userAgent.indexOf(item) !== -1) !== -1;
  }
}

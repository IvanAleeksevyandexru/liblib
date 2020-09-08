import { Observable } from 'rxjs';
import { LineBreak } from './common-enums';
import { HelperService } from '../services/helper/helper.service';

export const NO_ORIGINAL = {};
export const ITEM_DEFAULT_HEIGHT = 36;

// тип для пользовательского объекта-прототипа, "подходящего" для создания по нему списочного элемента
// т.е. содержащий допустимые пользовательские данные, соответствующие конструкции ListItem
export interface ListElement {

  id: number | string;
  text: string;

  unselectable?: boolean;
  hidden?: boolean;
  lineBreak?: LineBreak | string;
  groupId?: number | string;
  [others: string]: any; // объект-прототип для ListItem может содержать и "свои" (любые другие) свойства

}

// элемент списка (обертка вокруг собственно элемента массива модели), вьюшный внутренний класс
// используется в списочных элементах dropdown, lookup, multi-lookup, filtered-list
// имплементит ListElement, но пользователю не требуется самому инстанцировать этот класс, вход контролов - [...{} as ListElement]
export class ListItem implements ListElement {

  constructor(itemLike: ListElement | ListItem, originalItem?: any) {
    if (itemLike) {
      this.id = itemLike.id;
      this.text = itemLike.text;
      this.unselectable = itemLike.unselectable;
      this.hidden = itemLike.hidden;
      this.lineBreak = itemLike.lineBreak;
      this.groupId = itemLike.groupId;
    }
    if (originalItem !== undefined) {
      this.originalItem = originalItem;
    } else {
      this.originalItem = itemLike instanceof ListItem ? (itemLike as ListItem).originalItem : itemLike;
    }
  }

  // служит для идентификации объекта
  public id: number | string;                  // [!] заполняется пользователем в объекте-прототипе, обязательно
  // простое дефолтное текстовое представление итема, может быть кодом транслитерации и/или содержать raw html
  // используется для текстового поиска по нему и дефолтного вывода при отсутствии форматтеров/перевода
  public text: string;                         // [!] заполняется пользователем в объекте-прототипе, обязательно
  // содержит перевод .text для случая когда текст является кодом транслитерации для прямых операций например фильтрации
  public translated: string;                   // [X] заполняется системой, доступно в форматтерах
  // общее форматированное отображение итема в поле и списке, можно html, общий форматтер
  public formatted: string;                    // [X] заполняется системой
  // специальное отображение в списке, отличное от общего (если требуется), html/text
  public listFormatted: string;                // [X] заполняется системой
  // приведенное к тексту общее форматирование, для отображение в input текстовом поле, никакого html
  public textFormatted: string;                // [X] заполняется системой
  // форматирование в списке с подсветкой подстроки если таковая имеется
  public highlightFormatted: string;           // [X] заполняется системой
  // признак что подсветка подсветила весь итем целиком, от начала до конца
  public highlightedAll = false;               // [X] заполняется системой
  // статус выделения итема в списке
  public selected: boolean;                    // [X] заполняется системой
  // не показывать итем. он будет лежать в списке, но выводиться в списке не будет
  public hidden = false;                       // [?/X] заполняется пользователем (опционально) для !tree-view, системой в tree-view
  // должен ли быть итем недоступен для выбора (заголовки, сепаратору и прочие статичные элементы должны быть не доступны для выбора)
  public unselectable = false;                 // [?] заполняется пользователем в объекте-прототипе ListElement (если требуется)
  // нужен ли разделитель до, после итема или сам итем и есть разделитель
  public lineBreak: LineBreak | string = null; // [?] заполняется пользователем в объекте прототипе (если требуется)
  // служит для возможности оставлять заголовок групп при фильтрации и отображения структуры tree-like с отступами
  public groupId?: number | string;            // [?] заполняется пользователем (если нужна группировка / структура списка)
  // вложенность элемента при группировке/tree-view, может учитываться в стилистике (отступы), 1-based
  public groupLevel: number;                   // [X] заполняется системой если список с группировкой (есть итемы с groupId)
  // возможность "сворачиваться" - прятать и показывать нижележащие строки с groupId указывающим на "наш" id
  public collapsable = false;                  // [X] заполняется системой если список с группировкой (есть итемы с groupId)
  // состояние свертки при наличиии collapsable
  public collapsed = false;                    // [X] заполняется системой при свертке-развертке сворачиваемых узлов
  // предварительные оценочные габариты элемента для virtualScroll, вычисляются до его рендера в фоне
  public dimensions = null;                    // [X] заполняется системой
  // ссылка на оригинал объекта (объект-прототип), который пойдет в модель
  public originalItem: any;                    // [X] заполняется системой

  public static compare(a: ListItem, b: ListItem, strict = false): boolean {
    if (a && b) {
      if (strict) {
        if (a === b) {
          return true;
        } else if (a.originalItem === NO_ORIGINAL || b.originalItem === NO_ORIGINAL) {
          return false;
        } else {
          return a.originalItem === b.originalItem && a.id === b.id;
        }
      } else {
        return a.id === b.id;
      }
    } else {
      return a === b;
    }
  }

  public compare(anotherValue: ListItem, strict = false): boolean {
    return ListItem.compare(this, anotherValue, strict);
  }

  public findSame(collection: Array<ListItem>, strict = false): ListItem | null {
    return (collection || []).find((item: ListItem) => item.compare(this, strict));
  }

  public belongsTo(collection: Array<ListItem>, strict = false): boolean {
    return !!this.findSame(collection, strict);
  }

  public findIndexAmong(collection: Array<ListItem>, strict = false): number {
    return (collection || []).findIndex((item: ListItem) => item.compare(this, strict));
  }

  // подготоваливает форматирование итема для вывода используя форматтеры компонента
  public prepareFormatting(
      context?: { [name: string]: any },
      formatter?: (item: ListItem, context: { [name: string]: any }) => string,
      listFormatter?: (item: ListItem, context: { [name: string]: any }) => string): void {
    // как итем будет выводиться в поле инпута как хтмл
    // если виджет поддерживает вывод значения выбранного итема в хтмл формате, он должен использовать это поле
    this.formatted = formatter ? formatter(this, context) : (this.translated || this.text);
    // как итем будет выводиться в списке (может отличаться от вывода в поле), listFormatter имеет приоритет над formatter если указан
    this.listFormatted = listFormatter ? listFormatter(this, context) : this.formatted;
    // как итем будет выводиться в поле инпута как текст
    // если виджет не может вывести значение выбранного итема в хтмл формате (<input/> вью), он будет использовать это поле
    this.textFormatted = HelperService.htmlToText(this.formatted);
    // дефолт, если нужна подсветка будет перезаписано prepareHighlighting
    this.resetHighlighting();
  }

  public prepareHighlighting(query: string, caseSensitive = false, fromStartOnly = false) {
    this.highlightFormatted = HelperService.highlightSubstring(this.listFormatted, query, caseSensitive, fromStartOnly);
    this.highlightedAll = HelperService.isAllHighlighted(this.highlightFormatted, this.listFormatted);
  }

  public resetHighlighting() {
    this.highlightFormatted = this.formatted;
    this.highlightedAll = false;
  }

  // будут определены динамически
  public expand() {}
  public collapse() {}

  public setNoOriginal() {
    this.originalItem = NO_ORIGINAL;
  }

  public hasNoOriginal() {
    return this.originalItem === NO_ORIGINAL;
  }

  public getItemHeight() {
    return this.dimensions === null ? ITEM_DEFAULT_HEIGHT : this.dimensions.height;
  }
}

// элементы-подсказки для компонента autocomplete. не являются ListItem, т.к. не содержат идентификатора, транслитерации, группировки
export class AutocompleteSuggestion {

  constructor(value: string | any, originalItem: any) {
    this.text = typeof value === 'string' || value instanceof String ? value : value.text;
    this.originalItem = originalItem || value;
  }

  public text: string;
  public unselectable: boolean;
  public lineBreak: LineBreak | string = null;
  public highlightText: string;
  public highlightedAll: boolean;
  public originalItem: any;

  public prepareHighlighting(query: string, caseSensitive = false, fromStartOnly = false) {
    this.highlightText = HelperService.highlightSubstring(this.text, query, caseSensitive, fromStartOnly);
    this.highlightedAll = HelperService.isAllHighlighted(this.highlightText, this.text);
  }
}

// двусторонний набор конверов, способный обеспечить прозрачный слой преобразования
// между оригинальными объектами и их представлением внутри контролов
export class ListItemConverter<T = any> {

  constructor(inputConverter: (input: T, ctx?: { [name: string]: any }) => ListItem, outputConverter: (ListItem) => T) {
    this.inputConverter = inputConverter;
    this.outputConverter = outputConverter;
  }

  public inputConverter: (input: T, ctx?: { [name: string]: any }) => ListItem;
  public outputConverter: (ListItem, ctx?: { [name: string]: any }) => T;
}

// источник значений для лукапа, выполняющий асинхронный поиск по запросу
// тип T должен быть extends ListElement в норме, но может быть any если на элементе определен конвертер
export interface LookupProvider<T = any> {

  search: (query: string, context?: { [name: string]: any })
    => Promise<Array<T>> | Observable<Array<T>>;
}

// пейджированный провайдер, возвращает результат постранично (не инкрементально!), page - 0-based
// применяется вместо LookupProvider при incrementalSearch
export interface LookupPartialProvider<T = any> {

  searchPartial: (query: string, page: number, context?: { [name: string]: any })
    => Promise<Array<T>> | Observable<Array<T>>;
}

// источник значений для автокомплита, выполняющий асинхронный поиск по запросу
export interface AutocompleteSuggestionProvider {

  search: (query: string, context?: { [name: string]: any }) =>
    Promise<Array<string | any>> | Observable<Array<string | any>>;
}

// аналогично LookupProvider/LookupPartialProvider
export interface AutocompleteSuggestionPartialProvider {

  searchPartial: (query: string, page: number, context?: { [name: string]: any }) =>
    Promise<Array<string | any>> | Observable<Array<string | any>>;
}


import { OnInit, OnDestroy, Optional, ElementRef, Injectable, NgZone } from '@angular/core';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { LibTranslateService } from '../translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { Translation, LineBreak } from '../../models/common-enums';
import { VirtualScrollComponent } from '../../components/virtual-scroll/virtual-scroll.component';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { ListItem, ListElement, AutocompleteSuggestion, ListItemConverter } from '../../models/dropdown.model';
import { ListItemHierarchyService } from './list-items.hierarchy';
import { ListItemsAccessoryService } from './list-items.scroll';
export { FixedItemsProvider } from './list-items.search';
export { ListItemsVirtualScrollController } from './list-items.scroll';

export interface ListItemsOperationsContext {
  formatter?: (item: ListItem, context: { [name: string]: any }) => string;
  listFormatter?: (item: ListItem, context: { [name: string]: any }) => string;
  converter?: ListItemConverter;
  translation?: Translation;
  onLanguageChange?: () => void;
  highlightSubstring?: boolean;
  highlightFromStartOnly?: boolean;
  highlightCaseSensitive?: boolean;
  collapsableGroups?: boolean;
  virtualGroups?: boolean;
  virtualScroll?: boolean;
}

// не инжектится в root, это сервис инстанс которого привязан к инстансу контрола, т.к. необходим TranslateService,
// находящийся по месту расположения компонента, состояние связано с компонентом-хозяином также как и жизненный цикл
@Injectable()
export class ListItemsService implements OnInit, OnDestroy {

  private operationsContext = {} as ListItemsOperationsContext;
  private langSubscription: Subscription;

  constructor(private libTranslate: LibTranslateService, private ngZone: NgZone, @Optional() private appTranslate: TranslateService) {
  }

  public ngOnInit() {
    this.updateLangSubscription();
  }

  public ngOnDestroy() {
    this.clearLangSubscription();
  }

  public synchronizeOperationsContext(newCtx: ListItemsOperationsContext) {
    this.operationsContext = newCtx;
    this.updateLangSubscription();
  }

  public updateLangSubscription() {
    this.clearLangSubscription();
    if (this.operationsContext.onLanguageChange) {
      this.langSubscription = this.libTranslate.onLangChange.subscribe(() => this.operationsContext.onLanguageChange());
    }
  }

  public clearLangSubscription() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
      this.langSubscription = null;
    }
  }

  public createListItem(item: ListElement | ListItem | any, convertContext?: { [name: string]: any}): ListItem {
    if (item) {
      if (item instanceof ListItem) {
        if (item.originalItem === undefined) {
          item.setNoOriginal();
        }
        return item as ListItem;
      } else {
        const converter = this.operationsContext.converter ? this.operationsContext.converter.inputConverter : null;
        return converter ? converter(item, convertContext) : new ListItem(item, item);
      }
    } else {
      return null;
    }
  }

  public createListItems(items: ListElement | ListItem | any | Array<ListElement | ListItem | any>,
                         convertContext?: { [name: string]: any}): Array<ListItem> {
    if (Array.isArray(items)) {
      return items.map((item: ListItem | any, index: number) =>
        this.createListItem(item, this.addIndexToCtx(convertContext, index)));
    } else {
      return items ? [this.createListItem(items, convertContext)] : [];
    }
  }

  public restoreOriginal(item: ListItem, convertContext?: { [name: string]: any}): any {
    const converter = this.operationsContext.converter ? this.operationsContext.converter.outputConverter : null;
    if (converter) {
      return converter(item, convertContext);
    } else if (item) {
      return item.hasNoOriginal() ? item : item.originalItem;
    } else {
      return item;
    }
  }

  public restoreOriginals(items: ListItem | Array<ListItem>, convertContext?: { [name: string]: any}): Array<any> | any {
    if (Array.isArray(items)) {
      return items.map((item: ListItem, index: number) =>
        this.restoreOriginal(item, this.addIndexToCtx(convertContext, index)));
    } else {
      return [this.restoreOriginal(items, convertContext)];
    }
  }

  // переводит итемы (в этом случае .text это код транслитерации) однократно (без создания связи с сервисом и реакцией на смену языка)
  public translateItems(items: Array<ListItem>, forceTranslate = false): Observable<Array<ListItem>> {
    if (items && items.length && items.every((item) => item instanceof ListItem)) {
      const mode = this.operationsContext.translation;
      const service = mode === Translation.LIB ? this.libTranslate : (mode === Translation.APP ? this.appTranslate : null);
      if (service && (forceTranslate || items.some((item: ListItem) => !item.translated))) {
        const observables = items.map((item: ListItem) => service.get(item.text));
        return forkJoin(observables).pipe(map((translations: Array<string>) => {
          for (let i = 0; i < translations.length; i++) {
            items[i].translated = translations[i];
          }
          return items;
        }), catchError((e: any) => {
          return of(items); // игнорируем ошибки
        }));
      } else {
        return of(items);
      }
    } else {
      return of(items);
    }
  }

  // форматирует текст итемов, используя форматтеры (если требуется), либо .translated/.text
  // +запускает фоновый цикл обсчета высот элементов для virtualScroll (окончание не отслеживается)
  public formatItems(items: Array<ListItem>, formatContext?: { [name: string]: any }): Array<ListItem> {
    if (items) {
      const formatter = this.operationsContext.formatter;
      const listFormatter = this.operationsContext.listFormatter;
      items.forEach((item: ListItem, index: number) => {
        item.prepareFormatting(this.addIndexToCtx(formatContext, index), formatter, listFormatter);
      });
    }
    return items;
  }

  public translateFormat(items: Array<ListItem>, forceTranslate = false,
                         formatContext?: { [name: string]: any }): Observable<Array<ListItem>> {
    return this.translateItems(items, forceTranslate).pipe(tap((listItems: Array<ListItem>) => {
      this.formatItems(listItems, formatContext);
    }));
  }

  public evaluateItemsSizeAsync(items: Array<ListItem | AutocompleteSuggestion>, clientWidth: number): Observable<number> {
    return ListItemsAccessoryService.runBackgroundSizeEstimating(items, clientWidth, this.ngZone);
  }

  // восстанавливает структуру дерева и недостающие элементы по item.groupId. меняет исходный массив!
  public alignGroupsTreeIfNeeded(filteredItems: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    return ListItemHierarchyService.alignGroupsTreeIfNeeded(filteredItems, availableItems,
      this.operationsContext.virtualGroups, this.operationsContext.collapsableGroups);
  }

  public adjustVirtualGroupsSelectionIfNeeded(list: Array<ListItem>, rootElement?: ListItem) {
    return ListItemHierarchyService.adjustVirtualGroupsSelectionIfNeeded(list, this.operationsContext.virtualGroups, rootElement);
  }

  public getTerminalItems(root: ListItem, list: Array<ListItem>) {
    return ListItemHierarchyService.getTerminalItems(root, list);
  }

  public expandCollapse(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    ListItemHierarchyService.expandCollapseNode(switchedElement, list, evt);
  }

  public expand(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    ListItemHierarchyService.expandNode(switchedElement, list, evt);
  }

  public collapse(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    ListItemHierarchyService.collapseNode(switchedElement, list, evt);
  }

  public highlightSubstring(items: Array<ListItem>, query: string) {
    const opCtx = this.operationsContext;
    if (items && opCtx.highlightSubstring && query) {
      items.forEach((item: ListItem) => {
        item.prepareHighlighting(query, opCtx.highlightCaseSensitive, opCtx.highlightFromStartOnly);
      });
    }
  }

  public handleKeyboardNavigation(e: KeyboardEvent, items: Array<ListItem | AutocompleteSuggestion>,
                                  highlightedElement: ListItem | AutocompleteSuggestion,
                                  scrollArea: ElementRef | VirtualScrollComponent | PerfectScrollbarComponent)
                                  : ListItem | AutocompleteSuggestion | boolean {
    return ListItemsAccessoryService.handleKeyboardNavigation(
      e, items, highlightedElement, (item: ListItem) => this.isHighlightable(item, true), scrollArea);
  }

  public findNextItem(source: Array<ListItem | AutocompleteSuggestion>,
                      highlighted: ListItem | AutocompleteSuggestion, directionForward: boolean) {
    return ListItemsAccessoryService.findNextItem(
      source, highlighted, directionForward, (item: ListItem) => this.isHighlightable(item, true));
  }

  public scrollTo(scrollArea: ElementRef | VirtualScrollComponent | PerfectScrollbarComponent, elementIndex: number) {
    ListItemsAccessoryService.scrollTo(scrollArea, elementIndex);
  }

  public isHighlightable(item: ListItem | AutocompleteSuggestion, fromKeyboard = false) {
    if (item instanceof ListItem) {
      const listItem = item as ListItem;
      return !listItem.hidden && (this.isSelectable(item) ||
        (fromKeyboard && this.operationsContext.collapsableGroups ? listItem.collapsable : false));
   } else {
      return this.isSelectable(item);
    }
  }

  public isSelectable(item: ListItem | AutocompleteSuggestion) {
    if (item instanceof ListItem) {
      const listItem = item as ListItem;
      return !listItem.unselectable && listItem.lineBreak !== LineBreak.SELF
        && !(this.operationsContext.virtualGroups && listItem.collapsable);
    } else {
      return !item.unselectable && item.lineBreak !== LineBreak.SELF;
    }
  }

  private addIndexToCtx(context: { [name: string]: any}, originalIndex: number) {
    const ctx = context || {};
    if (ctx.noIndex) {
      ctx.index = null;
    } else if (ctx.indexBase !== undefined) {
      ctx.index = ctx.indexBase + originalIndex;
    } else {
      ctx.index = originalIndex;
    }
    return ctx;
  }
}


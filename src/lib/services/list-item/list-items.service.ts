import { OnInit, OnDestroy, Optional, ElementRef, Injectable } from '@angular/core';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { LibTranslateService } from '../translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { HelperService } from '../helper/helper.service';
import { ConstantsService } from '../constants.service';
import { Translation, LineBreak } from '../../models/common-enums';
import { ListItem, ListElement, AutocompleteSuggestion,
  ListItemConverter, LookupProvider, LookupPartialProvider } from '../../models/dropdown.model';

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
}

class ListItemGroup {
  public children: Array<ListItemGroup> = [];
  public header: ListItem;
  public find(item: ListItem) {
    return this.children.find((groupEl: ListItemGroup) => groupEl.header === item);
  }
  public add(item: ListItem): ListItemGroup {
    const existing = this.find(item);
    if (existing) {
      return existing;
    } else {
      const groupEl = new ListItemGroup();
      groupEl.header = item;
      this.children.push(groupEl);
      return groupEl;
    }
  }
  public out(level: number, path: Array<ListItem>, dest: Array<ListItem>) {
    if (this.header) {
      this.header.groupLevel = level;
      this.header.collapsable = !!this.children.length;
      this.header.hidden = path.some((item: ListItem) => item.collapsed);
      dest.push(this.header);
    }
    this.children.forEach((subGroup: ListItemGroup) => {
      subGroup.out(level + 1, this.header ? [].concat(path).concat(this.header) : path, dest);
    });
  }
}

export class HierarchyBuilder {

  public static isHierarchyList(list: Array<ListItem>) {
    return list && list.length && list.some((item: ListItem) => item.groupId);
  }

  public static alignGroupsTree(filteredItems: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    const treeView = new ListItemGroup();
    let unsorted = [].concat(filteredItems);
    const findGroup = (groupId: string | number): ListItem => {
      unsorted = unsorted.filter((item: ListItem) => item.id !== groupId);
      return availableItems.find((item: ListItem) => item.id === groupId);
    };
    const recoverPath = (item: ListItem) => {
      const itemPath = [findGroup(item.id)];
      let parentId = item.groupId;
      while (parentId !== undefined) {
        const pathIds = itemPath.map((pathEl: ListItem) => pathEl.id);
        if (pathIds.includes(parentId)) {
          break; // остановка рекурсии для некорректного (с циклами) графа связей
        }
        const parent = findGroup(parentId);
        itemPath.unshift(parent);
        parentId = parent.groupId;
      }
      let node = treeView;
      itemPath.forEach((pathFragment: ListItem) => {
        node = node.add(pathFragment);
      });
    };
    [].concat(unsorted).forEach((unsortedItem: ListItem) => {
      recoverPath(unsortedItem);
    });
    const output = [];
    treeView.out(0, [], output);
    return output;
  }

  public static findAppended(treeAligned: Array<ListItem>, initialList: Array<ListItem>): Array<ListItem> {
    const aligned = treeAligned;
    return aligned.filter((appendedItem: ListItem) => !initialList.includes(appendedItem));
  }

  public static getChildrenAligned(item: ListItem, treeAligned: Array<ListItem>, particularLevel?: number) {
    const children = [];
    const position = treeAligned.findIndex((someItem: ListItem) => someItem === item);
    if (position >= 0) {
      for (let i = position + 1; i < treeAligned.length; i++) {
        if (treeAligned[i].groupLevel <= item.groupLevel) {
          break;
        } else {
          if (particularLevel === undefined || treeAligned[i].groupLevel === particularLevel) {
            children.push(treeAligned[i]);
          }
        }
      }
    }
    return children;
  }

  public static collectChildren(items: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    const result = new Set<ListItem>();
    const put = (newItems: Array<ListItem>) => {
      newItems.forEach((item: ListItem) => result.add(item));
    };
    let collected = items;
    while (collected.length) {
      put(collected);
      collected = availableItems.filter((item: ListItem) => {
        return !result.has(item) && collected.some((collectedItem: ListItem) => item.groupId === collectedItem.id);
      });
    }
    return Array.from(result);
  }

}

// не инжектится в root, это сервис инстанс которого привязан к инстансу контрола, т.к. необходим TranslateService,
// находящийся по месту расположения компонента, состояние связано с компонентом-хозяином также как и жизненный цикл
@Injectable()
export class ListItemsService implements OnInit, OnDestroy {

  private operationsContext = {} as ListItemsOperationsContext;
  private langSubscription: Subscription;

  constructor(private libTranslate: LibTranslateService, @Optional() private appTranslate: TranslateService) {
  }

  public static findNextItem(source: Array<ListItem | AutocompleteSuggestion>, highlightedElement: ListItem | AutocompleteSuggestion,
                             directionForward: boolean, highlightableCheck: (ListItem) => boolean) {
    if (!source || !source.length) {
      return null;
    }
    const fromIndex = source.findIndex((item: ListItem | AutocompleteSuggestion) => item === highlightedElement);
    const initialIndex = fromIndex === -1 && !directionForward ? 0 : fromIndex;
    let index = initialIndex;
    do {
      index = directionForward ? ++index : --index;
      if (index < 0) {
        index = source.length - 1;
      } else if (index >= source.length) {
        index = 0;
      }
      if (highlightableCheck(source[index])) {
        return index;
      }
    } while (index !== initialIndex);
    return null;
  }

  public static scrollTo(scrollContainerBaseRef: ElementRef, elementIndex: number) {
    const scrollContainer = this.findScrollContainer(scrollContainerBaseRef);
    if (scrollContainerBaseRef && scrollContainer && elementIndex >= 0
        && elementIndex < scrollContainerBaseRef.nativeElement.childElementCount) {
      let itemElement = scrollContainerBaseRef.nativeElement.children[elementIndex];
      if (itemElement) {
        let height = 0;
        while (itemElement !== null) {
          height += itemElement.offsetHeight || 0;
          itemElement = itemElement.previousSibling;
        }
        scrollContainer.scrollTop = height - 100;
      }
    }
  }

  private static findScrollContainer(baseElement: ElementRef) {
    let base = baseElement && baseElement.nativeElement;
    let level = 0;
    while (level < 3 && !base.classList.contains('ps')) {
      base = base.parentElement;
      level ++;
    }
    return base.classList.contains('ps') ? base : null;
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
  public formatItems(items: Array<ListItem>, formatContext?: { [name: string]: any }): Array<ListItem> {
    if (items && items.length) {
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

  // восстанавливает структуру дерева и недостающие элементы по item.groupId. меняет исходный массив!
  public alignGroupsTreeIfNeeded(filteredItems: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    if (HierarchyBuilder.isHierarchyList(filteredItems)) {
      const hierarchyAligned = HierarchyBuilder.alignGroupsTree(filteredItems, availableItems);
      hierarchyAligned.filter((item: ListItem) => item.collapsable).forEach((item: ListItem) => {
        (item as any).collapse = () => this.collapse(item, availableItems);
        (item as any).expand = () => this.expand(item, availableItems);
      });
      this.adjustVirtualGroupsSelectionIfNeeded(hierarchyAligned);
      const appended = HierarchyBuilder.findAppended(hierarchyAligned, filteredItems);
      appended.forEach((appendedItem: ListItem) => {
        appendedItem.resetHighlighting();
      });
      HelperService.copyArrayToArray(hierarchyAligned, filteredItems);
    }
    return filteredItems;
  }

  public adjustVirtualGroupsSelectionIfNeeded(list: Array<ListItem>, rootElement?: ListItem) {
    if (this.operationsContext.virtualGroups === false) {
      return; // если группы можно выделять как обычные итемы - мы не позволяем регулирование их выделения кроме как пользователем
    }
    const elements = rootElement ? HierarchyBuilder.getChildrenAligned(rootElement, list, rootElement.groupLevel + 1) :
      list.filter((listElement: ListItem) => listElement.groupLevel === 1);
    elements.forEach((listElement: ListItem) => {
      if (listElement.collapsable) {
        this.adjustVirtualGroupsSelectionIfNeeded(list, listElement);
      }
    });
    if (rootElement && rootElement.collapsable) {
      rootElement.selected = this.operationsContext.virtualGroups === null ? false : elements.every((child: ListItem) => child.selected);
    }
  }

  public getFinalItems(list: Array<ListItem>, root: ListItem) {
    return HierarchyBuilder.getChildrenAligned(root, list).filter((item: ListItem) => !item.collapsable);
  }

  public expandCollapse(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (!switchedElement.collapsable) {
      return;
    }
    switchedElement.collapsed = !switchedElement.collapsed;
    const itemChildren = HierarchyBuilder.getChildrenAligned(switchedElement, list);
    const parents = [switchedElement];
    itemChildren.forEach((childItem: ListItem) => {
      const deltaLev = childItem.groupLevel - switchedElement.groupLevel;
      parents[deltaLev] = childItem;
      childItem.hidden = parents.slice(0, childItem.groupLevel - 1).some((parent) => parent.collapsed);
    });
    if (evt) {
      evt.stopPropagation();
    }
  }

  public expand(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (switchedElement.collapsed) {
      this.expandCollapse(switchedElement, list);
    }
    if (evt) {
      evt.stopPropagation();
    }
  }

  public collapse(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (!switchedElement.collapsed) {
      this.expandCollapse(switchedElement, list);
    }
    if (evt) {
      evt.stopPropagation();
    }
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
                                  scrollContainerBaseRef: ElementRef): ListItem | AutocompleteSuggestion | boolean {
    if (e.key === 'ArrowUp') {  // вверх
      e.preventDefault();
      e.stopPropagation();
      const prevVisible = this.findNextItem(items, highlightedElement, false);
      if (prevVisible !== null) {
        this.scrollTo(scrollContainerBaseRef, prevVisible);
        return items[prevVisible];
      }
    } else if (e.key === 'ArrowDown') {  // вниз
      e.preventDefault();
      e.stopPropagation();
      const nextVisible = this.findNextItem(items, highlightedElement, true);
      if (nextVisible !== null) {
        this.scrollTo(scrollContainerBaseRef, nextVisible);
        return items[nextVisible];
      }
    } else if (e.key === 'ArrowLeft') {
      if (this.operationsContext.collapsableGroups) {
        e.preventDefault();
        e.stopPropagation();
        if (highlightedElement instanceof ListItem) {
          if ((highlightedElement as ListItem).collapsable) {
            this.collapse(highlightedElement, items as Array<ListItem>, e);
            return true;
          }
        }
      }
    } else if (e.key === 'ArrowRight') {
      if (this.operationsContext.collapsableGroups) {
        e.preventDefault();
        e.stopPropagation();
        if (highlightedElement instanceof ListItem) {
          if ((highlightedElement as ListItem).collapsable) {
            this.expand(highlightedElement, items as Array<ListItem>, e);
            return true;
          }
        }
      }
    }
    return false;
  }

  public findNextItem(source: Array<ListItem | AutocompleteSuggestion>,
                      highlighted: ListItem | AutocompleteSuggestion, directionForward: boolean) {
    return ListItemsService.findNextItem(source, highlighted, directionForward, (item: ListItem) => this.isHighlightable(item, true));
  }

  public scrollTo(scrollContainerBaseRef: ElementRef, elementIndex: number) {
    ListItemsService.scrollTo(scrollContainerBaseRef, elementIndex);
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

// класс-фильтр по статичной коллекции, обеспечивает простой и постраничный поиск
export class FixedItemsProvider implements LookupProvider<ListItem>, LookupPartialProvider<ListItem> {

  public fixedItems: Array<ListItem>;
  public cachedResult: Array<ListItem>;
  public lastQuery: string;

  public static checkItem(item: ListItem, query: string, context?: { [name: string]: any }): boolean {
    const text = item.translated || item.text || '';
    if (context && context.searchCaseSensitive) {
      return context.searchFromStartOnly ? text.startsWith(query) : text.includes(query);
    } else {
      if (context && context.searchFromStartOnly) {
        return text.toUpperCase().startsWith(query.toUpperCase());
      } else {
        return text.toUpperCase().includes(query.toUpperCase());
      }
    }
  }

  public setSource(fixedItems: Array<ListItem>): FixedItemsProvider {
    this.fixedItems = fixedItems;
    this.clearCache();
    return this;
  }

  public cacheAndReturn(query: string, result: Array<ListItem>): Observable<Array<ListItem>> {
    this.lastQuery = query;
    this.cachedResult = result;
    return of(result);
  }

  public clearCache() {
    this.lastQuery = '';
    this.cachedResult = this.fixedItems;
  }

  public search(query: string, context?: { [name: string]: any }): Observable<Array<ListItem>> {
    if (query === this.lastQuery) {
      return of(this.cachedResult);
    } else if (query) {
      let filteredItems = (this.fixedItems || []).filter((item: ListItem) => {
        return FixedItemsProvider.checkItem(item, query, context);
      });
      if (HierarchyBuilder.isHierarchyList(this.fixedItems)) {
        const filteredGroups = filteredItems.filter((filtered: ListItem) => filtered.collapsable);
        const filteredGroupsContents = HierarchyBuilder.collectChildren(filteredGroups, this.fixedItems);
        const groupContents = filteredGroupsContents.filter((missingItem: ListItem) => !filteredItems.includes(missingItem));
        filteredItems = HierarchyBuilder.alignGroupsTree(filteredItems.concat(groupContents), this.fixedItems);
      }
      return this.cacheAndReturn(query, filteredItems);
    } else {
      return this.cacheAndReturn(query, this.fixedItems || []);
    }
  }

  public searchPartial(query: string, page: number, context?: { [name: string]: any }): Observable<Array<ListItem>> {
    return this.search(query, context).pipe(map((items: Array<ListItem>) => {
      const pageSize = context && context.partialPageSize || ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
      return (items || []).slice(page * pageSize, page * pageSize + pageSize);
    }));
  }
}

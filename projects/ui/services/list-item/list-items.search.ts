import { ListItem, LookupProvider, LookupPartialProvider } from '@epgu/ui/models/dropdown';
import { ListItemHierarchyService } from './list-items.hierarchy';
import { ConstantsService } from '@epgu/ui/services/constants';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
      filteredItems = ListItemHierarchyService.complementMissingGroupContentsIfNeeded(filteredItems, this.fixedItems);
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

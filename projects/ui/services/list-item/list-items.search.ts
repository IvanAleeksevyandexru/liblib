import { ListItem, LookupPartialProvider, LookupProvider } from '@epgu/ui/models/dropdown';
import { ListItemHierarchyService } from './list-items.hierarchy';
import { ConstantsService } from '@epgu/ui/services/constants';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface SearchContext {
  searchByTextFormatted?: boolean;
  partialPageSize?: number;
  [name: string]: any;
}
// класс-фильтр по статичной коллекции, обеспечивает простой и постраничный поиск
export class FixedItemsProvider implements LookupProvider<ListItem>, LookupPartialProvider<ListItem> {

  public fixedItems: Array<ListItem>;
  public cachedResult: Array<ListItem>;
  public lastQuery: string;

  public static checkItem(item: ListItem, query: string, context?: SearchContext): boolean {
    const text = (context?.searchByTextFormatted ? item.textFormatted : item.translated || item.text) || '';
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

  private filterItems(query: string, context?: SearchContext, escapeSimilarLetters?: boolean): Array<ListItem> {
    const fixedItems = this.fixedItems.map(item => new ListItem(item));
    if (escapeSimilarLetters) {
      fixedItems.forEach(item => {
        item.text = item.text.replace(/ё/gi, 'е').replace(/й/gi, 'и');
        item.textFormatted = item.textFormatted?.replace(/ё/gi, 'е').replace(/й/gi, 'и');
      });
    }
    return (fixedItems || []).filter((item: ListItem) => {
      return FixedItemsProvider.checkItem(item, query, context);
    });
  }

  public search(query: string, context?: SearchContext, escapeSimilarLetters?: boolean): Observable<Array<ListItem>> {
    if (query === this.lastQuery) {
      return of(this.cachedResult);
    } else if (query) {
      let filteredItems = this.filterItems(query, context, false);
      if (escapeSimilarLetters) {
        const escapedQuery = query.replace(/ё/gi, 'е').replace(/й/gi, 'и');
        const escapedList = this.filterItems(escapedQuery, context, true);

        escapedList.forEach(escaped => {
          const sameItem = filteredItems.find(filtered => filtered.id === escaped.id);
          if (!sameItem) {
            const originalItem = this.fixedItems.find(item => item.id === escaped.id);
            filteredItems.push(originalItem);
          }
        });
      }
      filteredItems = ListItemHierarchyService.complementMissingGroupContentsIfNeeded(filteredItems, this.fixedItems);
      return this.cacheAndReturn(query, filteredItems);
    } else {
      return this.cacheAndReturn(query, this.fixedItems || []);
    }
  }

  public searchPartial(query: string, page: number, context?: SearchContext): Observable<Array<ListItem>> {
    return this.search(query, context).pipe(map((items: Array<ListItem>) => {
      const pageSize = context && context.partialPageSize || ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
      return (items || []).slice(page * pageSize, page * pageSize + pageSize);
    }));
  }
}


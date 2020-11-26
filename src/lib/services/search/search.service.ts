import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { LookupProvider } from '../../models/dropdown.model';
import { SearchSputnikSuggests, SimpleSputnikSuggest } from '../../models/search';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements LookupProvider<SimpleSputnikSuggest> {
  private globalSearchPlaceholder: BehaviorSubject<string> = new BehaviorSubject<string>('Например: пособие 3-7 лет подробнее');
  public globalSearchPlaceholder$ = this.globalSearchPlaceholder.asObservable();

  constructor(private http: HttpClient,
              private loadService: LoadService) { }

  // public search(query: string, configuration?: { [name: string]: any }) {
  //   return this.http.get(`${this.loadService.config.searchApiUrl}suggest`, {
  //       withCredentials: true,
  //       params: {
  //         _: `${Math.random()}`,
  //         query: `${query}`,
  //         serviceRecipient: 'all'
  //       }
  //   }).pipe(map((results: SearchSuggests) => results.suggests));
  // }

  public search(query: string, configuration?: { [name: string]: any }) {
    return this.http.get(`${this.loadService.config.searchSputnikApiUrl}`, {
        withCredentials: true,
        params: {
          _: `${Math.random()}`,
          q: `${query}`
        }
    }).pipe(
      map(this.handleSputnikResults)
    );
  }

  public setGlobalSearchPlaceholder(placeholder: string): void {
    this.globalSearchPlaceholder.next(placeholder);
  }

  private handleSputnikResults(results: SearchSputnikSuggests): SimpleSputnikSuggest[] {
    function makeTitleWithIconClass(title: string, category: string, isChild: boolean): string {
      const categoriesWithIcon = {service: 'services', structure: 'departments', suggest: 'suggests'};
      const className: string = isChild ? 'child' : (categoriesWithIcon[category] || 'info');
      return `<div class="icon ${className}">${title}</div>`;
    }

    function handleItems(items: SimpleSputnikSuggest[], category: string, isChilds?: boolean): SimpleSputnikSuggest[] {
      const result = [];
      items.forEach(item => {
        item.name = makeTitleWithIconClass(item.name, category, isChilds);
        result.push(item);
        if (item.children?.length) {
          const childs = handleItems(item.children, category, true);
          result.push(...childs);
        }
      });
      return result;
    }

    const categories: string[] = ['service', 'help', 'situation', 'structure', 'other', 'suggest'];
    let suggestions: SimpleSputnikSuggest[] = [];
    categories.forEach(category => {
      const resultInCategory = results[category];
      if (resultInCategory?.length) {
        const items = resultInCategory.slice(0, 3);
        const result = handleItems(items, category);
        suggestions = suggestions.concat(result);
      }
    });
    return suggestions;
  }
}

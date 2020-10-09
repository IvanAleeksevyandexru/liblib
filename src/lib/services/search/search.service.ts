import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { LookupProvider } from '../../models/dropdown.model';
import { SearchSputnikSuggests, SimpleSputnikSuggest } from '../../models/search';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from "rxjs";

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
    function makeTitleWithIconClass(title: string, category: string): string {
      const categoriesWithIcon = {service: 'services', structure: 'departments', suggest: 'suggests'};
      const className: string = categoriesWithIcon[category] || 'info';
      return `<div class="icon ${className}">${title}</div>`
    }

    const categories: string[] = ['service', 'help', 'situation', 'structure', 'other', 'suggest'];
    let suggestions: SimpleSputnikSuggest[] = [];
    categories.forEach(category => {
      const resultInCategory = results[category];
      if (resultInCategory?.length) {
        suggestions = suggestions.concat(resultInCategory.slice(0, 3).map(item => {
          item.name = makeTitleWithIconClass(item.name, category);
          return item;
        }));
      }
    });
    return suggestions;
  }
}

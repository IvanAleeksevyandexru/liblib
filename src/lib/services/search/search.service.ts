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
              private loadService: LoadService) {
  }

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
    function makeTitleWithIconClass(item: SimpleSputnikSuggest, category: string): string {
      const selfImage = ['service', 'structure', 'situation'];
      const infoImage = ['faq', 'info', 'other', 'help'];
      const suggestImage = 'suggest';
      let iconBlock = '';
      if (selfImage.includes(category)) {
        iconBlock = `<div class="icon" style="background-image: url('${item.image}');"></div>`;
      }
      if (infoImage.includes(category)) {
        iconBlock = `<div class="icon info"></div>`;
      }
      if (suggestImage === category) {
        iconBlock = `<div class="icon suggests"></div>`;
      }
      return `<div class="item-content">
                      ${iconBlock}
                      <div>${item.name}</div>
                      </div>`;
    }

    function handleItems(items: SimpleSputnikSuggest[], category: string, suggestionsLength: number): SimpleSputnikSuggest[] {
      const result = [];
      let lineBreakNeeded = true;
      items.forEach(item => {
        item.name = makeTitleWithIconClass(item, category);
        if (item.children?.length) {
          const childs = handleItems(item.children, category, suggestionsLength);
          result.push(...childs);
        } else {
          if (category === 'suggest') {
            if (suggestionsLength && lineBreakNeeded) {
              item.lineBreak = 'before';
              lineBreakNeeded = false;
            } else {
              lineBreakNeeded = false;

            }
          }
          result.push(item);
        }
      });
      return result;
    }

    const categories: string[] = ['situation', 'service', 'help', 'structure', 'other', 'suggest'];
    let suggestions: SimpleSputnikSuggest[] = [];
    categories.forEach(category => {
      const resultInCategory = results[category];
      if (resultInCategory?.length) {
        const result = handleItems(resultInCategory, category, suggestions.length);
        suggestions = suggestions.concat(result);
      }
    });
    return suggestions;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { LookupProvider } from '../../models/dropdown.model';
import { SearchSputnikConfig, SearchSputnikSuggests, SearchSuggests, SimpleSputnikSuggest } from '../../models/search';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements LookupProvider<SimpleSputnikSuggest> {
  private globalSearchPlaceholder: BehaviorSubject<string> = new BehaviorSubject<string>('Например: пособие 3-7 лет подробнее');
  public globalSearchPlaceholder$ = this.globalSearchPlaceholder.asObservable();
  private newSputnikSearchEnabled = this.loadService.config.newSputnikSearchEnabled;

  constructor(private http: HttpClient,
              private loadService: LoadService) {
  }

  public search(query: string, configuration?: { [name: string]: any }): Observable<SimpleSputnikSuggest[]> {
    const cfg = this.getConfigurations(query);
    return this.http.get(cfg.url, {
      withCredentials: true,
      params: cfg.request
    }).pipe(map((res: SearchSputnikSuggests | SearchSuggests) => {
      if (this.newSputnikSearchEnabled) {
        return this.handleNewSputnikResults(res as SearchSputnikSuggests);
      } else {
        return this.handleOldSputnikResults(res as SearchSuggests);
      }
    }));
  }

  public setGlobalSearchPlaceholder(placeholder: string): void {
    this.globalSearchPlaceholder.next(placeholder);
  }

  private handleNewSputnikResults(results: SearchSputnikSuggests): SimpleSputnikSuggest[] {
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
                ${iconBlock}<div>${item.name}</div>
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

  private handleOldSputnikResults(results: SearchSuggests): SimpleSputnikSuggest[] {
    const result: SearchSputnikSuggests = {
      suggest: [],
      service: [] // этот тип, потому что надо юзать картинку из ответа
    };
    (results.suggests || []).map((it) => {
      const res = {
        name: it.header,
        image: it.favicon,
        link: it.url
      };
      if (it.type === 'pgu_marker') {
        result.service.push(res);
      } else {
        result.suggest.push(res);
      }
    });
    return this.handleNewSputnikResults(result);
  }

  private getConfigurations(query?: string): SearchSputnikConfig {
    if (this.newSputnikSearchEnabled) {
      return {
        url: this.loadService.config.searchSputnikApiUrl,
        request: {
          _: `${Math.random()}`,
          q: `${query}`
        }
      };
    } else {
      return {
        url: `${this.loadService.config.searchApiUrl}suggest`,
        request: {
          _: `${Math.random()}`,
          query,
          serviceRecipient: 'all'
        }
      };
    }
  }
}

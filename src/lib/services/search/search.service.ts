import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { LookupProvider } from '../../models/dropdown.model';
import { SearchSuggests, SearchSuggestion } from '../../models/search';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements LookupProvider<SearchSuggestion> {

  constructor(private http: HttpClient,
              private loadService: LoadService) { }

  public search(query: string, configuration?: { [name: string]: any }) {
    return this.http.get(`${this.loadService.config.searchApiUrl}suggest`, {
        withCredentials: true,
        params: {
          _: `${Math.random()}`,
          query: `${query}`,
          serviceRecipient: 'all'
        }
    }).pipe(map((results: SearchSuggests) => results.suggests));
  }
}

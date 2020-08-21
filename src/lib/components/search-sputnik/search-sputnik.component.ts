import { AfterViewInit, Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { SearchSuggestion } from '../../models/search';
import { ListItem, ListItemConverter } from '../../models/dropdown.model';
import { LookupComponent } from '../lookup/lookup.component';
import { SearchService } from '../../services/search/search.service';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-search-sputnik',
  templateUrl: './search-sputnik.component.html',
  styleUrls: ['./search-sputnik.component.scss']
})
export class SearchSputnikComponent implements OnInit, AfterViewInit {

  @Input() public hideToIcon = false;
  public showField = true;

  public searchItem: SearchSuggestion;

  public searchProvider = this.searchService;
  public converter = new ListItemConverter<SearchSuggestion>((item: SearchSuggestion, ctx: { [name: string]: any}): ListItem => {
    return new ListItem({ id: ctx.index, text: item.header, icon: item.favicon || '', url: item.url}, item);
  }, (item: ListItem): SearchSuggestion => {
    return item.originalItem;
  });

  @ViewChild('searchBox') private searchBox;
  @ViewChild('lookup') public lookup: LookupComponent;

  @HostListener('document:scroll') public onScroll() {
    if (this.hideToIcon) {
      this.showField = false;
    }
  }

  constructor(private searchService: SearchService,
              private loadService: LoadService) { }

  public ngOnInit() {
    if (this.hideToIcon) {
      this.showField = false;
    }
  }

  public ngAfterViewInit() {
  }

  public formatter(item) {
    if (!item) {
      return;
    }
    if (item.originalItem.favicon) {
      return `<div class="item-wrapper">
                <div class="icon" style="background-image: url(${item.originalItem.favicon});"></div>
                <div class="suggestion with-icon">${item.text}</div>
              </div>`;
    } else {
      return `<div class="item-wrapper">
                 <div class="suggestion">${item.text}</div>
              </div>`;
    }
  }

  public onSearch() {
    const query = this.lookup.query ? this.lookup.query.trim() : '';
    if (this.searchItem && this.searchItem.url && query === this.searchItem.header) {
      document.location.href = this.searchItem.url;
    } else {
      document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(query);
    }
  }

  public toggleField() {
    this.showField = !this.showField;
  }
}

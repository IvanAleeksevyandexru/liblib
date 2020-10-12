import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SearchSuggestion, SimpleSputnikSuggest } from '../../models/search';
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
  @Input() public placeholder = 'Например: пособие 3-7 лет подробнее';
  @Input() public useGlobalPlaceholder = false;
  @Input() public contextClass = '';
  @Output() public opened = new EventEmitter();
  @Output() public closed = new EventEmitter();
  public showField = true;

  public searchItem: SimpleSputnikSuggest;

  public searchProvider = this.searchService;
  public showMagnifyingGlass = true;
  public converter = new ListItemConverter<SimpleSputnikSuggest>((item: SimpleSputnikSuggest, ctx: { [name: string]: any}): ListItem => {
    return new ListItem({ id: ctx.index, text: item.name, icon: 'TEST', url: item.link}, item);
  }, (item: ListItem): SimpleSputnikSuggest => {
    return (item?.originalItem) || null;
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
    if (this.useGlobalPlaceholder) {
      this.searchService.globalSearchPlaceholder$.subscribe((placeholder: string) => {
        this.placeholder = placeholder;
      });
    }
  }

  public ngAfterViewInit() {
  }

  public toggleMagnifyingGlass() {
    const query = this.lookup.query ? this.lookup.query.trim() : '';
    this.showMagnifyingGlass = !query.length;
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
    if (query) {
      if (this.searchItem && this.searchItem.link) {
        document.location.href = this.searchItem.link;
      } else {
        document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(query);
      }
    }
  }

  public toggleField() {
    this.showField = !this.showField;
  }

  public toggleSearch(open: boolean): void {
    if (open) {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }
}

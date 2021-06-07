import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { SimpleSputnikSuggest } from '../../models/search';
import { ListItem, ListItemConverter } from '../../models/dropdown.model';
import { LookupComponent } from '../lookup/lookup.component';
import { SearchService } from '../../services/search/search.service';
import { LoadService } from '../../services/load/load.service';
import { ConstantsService } from '../../services';
import { SharedService } from '../../services/shared/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-search-sputnik',
  templateUrl: './search-sputnik.component.html',
  styleUrls: ['./search-sputnik.component.scss']
})
export class SearchSputnikComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() public hideToIcon = false;
  @Input() public placeholder = 'Например: пособие 3-7 лет подробнее';
  @Input() public useGlobalPlaceholder = false;
  @Input() public contextClass = 'search-sputnik';
  @Input() public cachedResponse?: boolean;
  @Input() public staticList?: boolean;
  @Input() public mainPageStyle = false;
  @Input() public removeTags = false;
  @Input() public hideSearchResult = false;
  @Input() public setFocus = false;
  @Input() public setSearchValue = '';
  @Input() public disableSputnikData = false;
  @Input() public highlightSubstring = true;
  @Input() public searchQuery = '';
  // активация автоматического перевода с английского
  @Input() public enableLangConvert = false;
  // Остановка запросов к спутник апи в случае, если пользователь вошел в чат с Цифровым Ассистентом
  @Input() public stopSearch = false;
  // ожидание (мс) до срабатывания поиска с последнего ввода символа
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  // максимальная длинна введенной фразы
  @Input() public maxLength = 400;

  @Output() public opened = new EventEmitter();
  @Output() public closed = new EventEmitter();
  @Output() public focused = new EventEmitter();
  @Output() public searchChanged = new EventEmitter();
  @Output() public sputnikSearchResult = new EventEmitter();
  @Output() public searchButtonClick = new EventEmitter<string>();
  @Output() public blockedSearchClear = new EventEmitter();
  public showField = true;

  public searchItem: SimpleSputnikSuggest;

  public searchProvider = this.searchService;
  public showMagnifyingGlass = false;
  public converter = new ListItemConverter<SimpleSputnikSuggest>((item: SimpleSputnikSuggest, ctx: { [name: string]: any}): ListItem => {
    return new ListItem({ id: ctx.index, text: item.name, icon: '', url: item.link, lineBreak: item.lineBreak}, item);
  }, (item: ListItem): SimpleSputnikSuggest => {
    return (item?.originalItem) || null;
  });

  private sharedSubscription: Subscription;

  @ViewChild('searchBox') private searchBox;
  @ViewChild('lookup') public lookup: LookupComponent;

  @HostListener('document:scroll') public onScroll() {
    if (this.hideToIcon) {
      this.showField = false;
    }
  }

  constructor(
    private searchService: SearchService,
    private loadService: LoadService,
    public sharedService: SharedService,
  ) { }

  public ngOnInit() {
    if (this.hideToIcon) {
      this.showField = false;
    }
    if (this.useGlobalPlaceholder) {
      this.searchService.globalSearchPlaceholder$.subscribe((placeholder: string) => {
        this.placeholder = placeholder;
      });
    }
    this.sharedSubscription = this.sharedService.on('clearSearch').subscribe((val) => {
      if (val && this.lookup) {
        this.lookup.query = '';
      }
    });
  }

  public ngAfterViewInit() {}

  public ngOnChanges({setFocus, setSearchValue, stopSearch}: SimpleChanges) {
    if (setFocus && setFocus.currentValue) {
      this.lookup.setSearchBarFocus();
    }
    if (setSearchValue && setSearchValue.currentValue) {
      this.lookup.setSearchBarFocus(setSearchValue.currentValue);
    }
    if (stopSearch && !stopSearch.currentValue && !stopSearch.firstChange) {
      this.lookup.lookupItems(this.searchQuery, true);
    }
  }

  public ngOnDestroy(): void {
    this.sharedSubscription.unsubscribe();
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
        document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(this.searchItem.query || query);
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

  public focusEvent(): void {
    this.focused.emit();
  }

  public searchChangeHandler(searchQuery: string): void {
    this.searchChanged.emit(searchQuery);
  }

  public emptyResultHandler(resultLength: number): void {
    // if (resultLength === 0) {
    //   document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(this.lookup.query);
    // }
  }

  public processSearchResult(list: ListItem[]): void {
    if (!this.stopSearch) {
      const error = list.length === 1 && list[0].originalItem.error;
      const originalList = error ? [] : list.map(item => item.originalItem);
      this.sputnikSearchResult.emit({
        query: this.lookup.query,
        originalList,
        error
      });
    }
  }

  public handleSearchButtonClick(query: string): void {
    this.searchButtonClick.emit(query);
  }

  public clearBlocked(): void {
    this.blockedSearchClear.emit();
  }

}

import {
  OnInit, AfterViewInit, OnChanges, ChangeDetectorRef, SimpleChanges, Component, ElementRef,
  EventEmitter, forwardRef, Input, Output, ViewChild, Optional, Host, SkipSelf
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem, SubstringHighlightedItem, ListItemConverter, LookupProvider } from '../../models/dropdown.model';
import { from, of, Observable } from 'rxjs';
import { FocusManager } from '../../services/focus/focus.manager';
import { Translation, InconsistentReaction } from '../../models/common-enums';
import { HelperService } from '../../services/helper/helper.service';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { ConstantsService } from '../../services/constants.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'lib-lookup',
  templateUrl: 'lookup.component.html',
  styleUrls: ['./lookup.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LookupComponent),
    multi: true
  }]
})
export class LookupComponent implements OnInit, AfterViewInit, OnChanges, ControlValueAccessor, Validated {

  constructor(
    private changeDetector: ChangeDetectorRef,
    private positioningManager: PositioningManager,
    protected focusManager: FocusManager,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер разметки для deep классов
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled = false;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string = ValidationShowOn.TOUCHED;
  @Input() public maxlength?: number;
  @Input() public placeholder?: string;

  // фукнция форматирования для выбранного итема и итемов элементов списка
  @Input() public formatter?: (item: SubstringHighlightedItem, query: string, index: number) => string;
  // фукнция форматирования итемов элементов списка без влияния на модель
  @Input() public listFormatter?: (item: SubstringHighlightedItem) => string;
  // конвертер объединяет входной и выходной конвертер для объектов не подходящих под интерфейс {id, text}
  @Input() public converter?: ListItemConverter;

  @Input() public highlightSubstring = true;
  @Input() public escapeHtml = false;
  @Input() public containerOverlap = false;
  @Input() public clearable = false;
  @Input() public showMagnifyingGlass = true;
  @Input() public showExpandCollapse = false;
  @Input() public translation: Translation | string = Translation.NONE;
  @Input() public clearInconsistent: InconsistentReaction | string = InconsistentReaction.RESTORE;

  @Input() public searchOnFocus = true;
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  @Input() public queryMinSymbolsCount = 1;
  @Input() public searchFromStartOnly = false;
  @Input() public searchCaseSensitive = true;
  @Input() public showNotFound = false;
  @Input() public showSuggestion = false;

  @Input() public fixedItems: Array<any> = [];
  @Input() public itemsProvider: LookupProvider<any>;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public changed = new EventEmitter<ListItem>();
  @Output() public cleared = new EventEmitter();

  public internalFixedItems: Array<ListItem> = [];
  public internalItem: ListItem;
  public get item() {
    return this.internalItem;
  }
  public set item(item: ListItem) {
    this.internalItem = item;
    this.restoreQuery();
  }

  // непосредственно показываемые итемы списка
  public items: Array<SubstringHighlightedItem> = [];
  public highlighted: SubstringHighlightedItem = null;

  public query = '';
  public searching = false;
  public expanded = false;
  public invalidDisplayed = false;
  public positioningDescriptor: PositioningRequest = null;
  public forceShowStatic = false;
  public htmlPlaceholder: string;
  public control: AbstractControl;
  public suggestion: string;
  public suggested: ListItem;
  public suggestionJustSelected = false;
  private insureSearchActiveToken = 0;
  // компонент может работать на заданном фиксированном списке значений или не внешнем поиске
  public fixedItemsProvider = new (class FixedItemsLookupProvider implements LookupProvider {
    constructor(lookupRef: LookupComponent) {
      this.lookupRef = lookupRef;
    }
    public lookupRef: LookupComponent;
    public search(query: string, configuration: { [name: string]: any }) {
      return of(this.lookupRef.internalFixedItems.filter((item: ListItem) => {
        if (configuration.searchCaseSensitive) {
          return configuration.searchFromStartOnly ? item.text.startsWith(query) : item.text.includes(query);
        } else {
          if (configuration.searchFromStartOnly) {
            return item.text.toUpperCase().startsWith(query.toUpperCase());
          } else {
            return item.text.toUpperCase().includes(query.toUpperCase());
          }
        }
      }).map((item: ListItem) => item.originalItem));
    }
  })(this);

  @ViewChild('scrollableArea') private scrollableArea: ElementRef;
  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('searchBar', {static: false}) private searchBar: SearchBarComponent;
  @ViewChild('lookupField') private fieldContainer: ElementRef;
  @ViewChild('lookupList', {static: false}) private listContainer: ElementRef;

  private onTouchedCallback: () => void;
  private commit(value: any) {}

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'fixedItems': {
          this.setItems(this.fixedItems, true);
          break;
        }
        case 'itemsProvider': {
          this.setItems([], false);
          break;
        }
      }
    }
    this.check();
  }

  public update() {
    this.setItems(this.itemsProvider ? [] : this.fixedItems, !!this.itemsProvider);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  public check() {
    if (this.searchBar) {
      if (this.control) {
        this.searchBar.setTouched(this.control.touched);
      }
      this.searchBar.check();
    }
    this.htmlPlaceholder = /<|>/.test(this.placeholder) ? this.placeholder : null;
  }

  public clearInput(): void {
    if (!this.disabled) {
      this.selectItem(null);
      this.cleared.emit();
    }
  }

  public restoreQuery() {
    this.query = this.item ? this.unformat(this.item) : '';
  }

  public cancelSearch() {
    this.searchBar.cancelSearch();
    this.insureSearchActiveToken = ++this.insureSearchActiveToken % 1000;
    this.searching = false;
  }

  public handleBlur(raisedByOutsideClick = false) {
    this.cancelSearch();
    this.closeDropdown();
    this.resetItemIfNotConsistent();
    if (raisedByOutsideClick) {
      this.focusManager.notifyFocusMayLost(this.searchBar);
    } else {
      this.blur.emit();
    }
  }

  public handleFocus() {
    this.showTextField();
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.showTextField();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    this.searchBar.returnFocus(e);
  }

  public setItems(value: Array<any>, consistencyCheck = true) {
    if (value && value.length) {
      if (this.converter) {
        this.internalFixedItems = value.map(this.converter.inputConverter);
      } else {
        this.internalFixedItems = value.map((item: any) => new ListItem(item, item));
      }
    } else {
      this.internalFixedItems = [];
    }
    this.internalFixedItems.forEach((item: ListItem, index: number) => {
      item.formatted = this.format(item, '', index);
    });
    this.items = [];
    if (consistencyCheck) {
      // проверка консистентности итема (его наличия в fixed)
      this.item = this.internalFixedItems.find((item) => item.compare(this.item)) ? this.item : null;
    }
  }

  public selectItem(item: SubstringHighlightedItem, passive = false) {
    if (!passive) {
      this.forceShowStatic = true;
      this.returnFocus();
    }
    this.cancelSearch();
    const isNew = !ListItem.compare(this.item, item);
    this.item = item; // форсируем обновление текста
    if (isNew) {
      const outputValue = item ? (this.converter ? this.converter.outputConverter(item) : item.originalItem) : item;
      this.commit(outputValue);
      this.changed.emit(outputValue);
    }
    this.closeDropdown();
  }

  public lookupItemsOrClose(showAll = false) {
    if (this.focusManager.isJustFocused(this.searchBar)) {
      return;  // будет обработано focus хендлером
    }
    if (this.expanded) {
      this.closeDropdown();
    } else {
      if (!this.disabled) {
        this.showTextField();
        this.lookupItems(this.query, showAll);
      }
    }
  }

  public format(item: ListItem, query: string, index: number) {
    return this.formatter ? this.formatter(item, query, index) : item.text;
  }

  public unformat(item: ListItem) {
    return HelperService.htmlToText(item.formatted).trim();
  }

  public lookupItems(query: string, showAll = false) {
    if (this.searching) {
      return;
    }
    if (query.length < this.queryMinSymbolsCount && !showAll) {
      this.closeDropdown();
      return;
    }
    const provider = this.itemsProvider ? this.itemsProvider : this.fixedItemsProvider;
    const promiseOrObservable = provider.search(showAll ? '' : query, this.createSearchConfiguration(showAll));
    this.searching = true;
    this.suggestion = this.suggested = null;
    const activeSearch = promiseOrObservable instanceof Promise ?
      from(promiseOrObservable) : promiseOrObservable as Observable<Array<any>>;
    ((activeToken) => {
      activeSearch.subscribe((filteredItems: Array<any>) => {
        this.searching = false;
        if (this.insureSearchActiveToken !== activeToken) {
          return; // не обрабатываем поиск если он утратил актуальность
        }
        const itemsConverted: Array<ListItem> = (filteredItems || []).map(
          (item: any) => this.converter ? this.converter.inputConverter(item) : new ListItem(item));
        this.items = (itemsConverted || []).map(
          (item: ListItem) => this.createFilteredItem(item, showAll ? '' : query, this.searchCaseSensitive));
        this.items.forEach((item: ListItem, index: number) => {
          item.formatted = this.format(item, query, index);
        });
        if (this.items.length || this.showNotFound) {
          this.updateSuggestion(query);
          this.openDropdown();
        } else {
          this.closeDropdown();
        }
      }, e => {
        console.error(e);
        this.expanded = this.searching = false;
        this.changeDetector.detectChanges();
      });
    })(this.insureSearchActiveToken);
  }

  public openDropdown() {
    if (!this.disabled && !this.expanded && (this.items.length || this.showNotFound)) {
      this.expanded = true;
      this.highlight(null);
      this.changeDetector.detectChanges();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.fieldContainer, slave: this.listContainer,
          destroyOnScroll: true, destroyCallback: this.closeDropdown.bind(this)} as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
      this.updateScrollBars();
    }
  }

  public closeDropdown() {
    this.expanded = false;
    if (this.containerOverlap) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
    this.suggestion = this.suggested = this.highlighted = null;
  }

  public showTextField() {
    this.forceShowStatic = false;
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    const highlightedElementIndex = this.items.findIndex((item: ListItem) => item.compare(this.highlighted));
    if (e.key === 'Tab') {  // tab
      // blur, скрывем дропдаун чтобы ползунок скролла не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // enter
      if (this.suggestionJustSelected) {
        this.suggestionJustSelected = false;
        return;
      }
      if (this.expanded && this.highlighted) {
        this.selectItem(this.highlighted);
      } else {
        this.lookupItemsOrClose();
      }
    } else if (e.key === 'ArrowUp') { // up
      if (this.expanded && this.items.length) {
        const prevItemIndex = this.findNextNavigationItem(highlightedElementIndex, false);
        this.highlight(this.items.length ? this.items[prevItemIndex] : null);
        this.scrollTo(this.highlighted);
      }
    } else if (e.key === 'ArrowDown') {  // down
      if (this.expanded && this.items.length) {
        const nextItemIndex = this.findNextNavigationItem(highlightedElementIndex, true);
        this.highlight(this.items.length ? this.items[nextItemIndex] : null);
        this.scrollTo(this.highlighted);
      }
    } else if (e.key === 'Escape') { // escape
      this.closeDropdown();
    }
  }

  public updateSuggestion(query: string, item?: ListItem) {
    let suggestedItem = item;
    const check = (suggested: ListItem) => {
        const itemText = this.unformat(suggested);
        return this.searchCaseSensitive ? itemText.startsWith(query) : itemText.toUpperCase().startsWith(query.toUpperCase());
    };
    if (!suggestedItem) {
      suggestedItem = (this.items || []).find(check);
    }
    if (this.showSuggestion && suggestedItem && check(suggestedItem)) {
      this.suggested = suggestedItem;
      const suggestion = this.unformat(suggestedItem).substring(query.length);
      this.suggestion = suggestion ? suggestion.replace(/\s/g, '&nbsp;') : null;
    } else {
      this.suggested = this.suggestion = null;
    }
  }

  public selectSuggestion(suggestion: string) {
    if (this.suggested) {
      this.selectItem(this.suggested);
    } else {
      this.suggestion = this.suggested = null;
    }
    this.suggestionJustSelected = true;
  }

  public highlight(item: SubstringHighlightedItem) {
    this.highlighted = item;
    this.updateSuggestion(this.query, item);
  }

  /**
   * Notified when model changed
   */
  public writeValue(value: any) {
    const item = value ? this.converter ? this.converter.inputConverter(value, -1) : new ListItem(value) : value;
    if (item) {
      item.formatted = this.format(item, '', -1);
    }
    this.item = item;
    this.suggestion = this.suggested = null;
    this.changeDetector.detectChanges();
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.searchBar.setDisabledState(isDisabled);
  }

  private resetItemIfNotConsistent() {
    if (this.expanded || this.clearInconsistent === InconsistentReaction.IGNORE) {
      return;
    }
    const query = this.query;
    this.restoreQuery();
    if (this.query !== query && this.clearInconsistent === InconsistentReaction.RESET) {
      this.selectItem(null, true);  // сбрасываем итем если текст был изменен и более не соответствует модельному итему
    }
  }

  private findNextNavigationItem(fromIndex: number, directionForward: boolean) {
    let index = fromIndex === -1 && !directionForward ? 0 : fromIndex;
    index = directionForward ? ++index : --index;
    if (index < 0) {
      index = this.items.length - 1;
    } else if (index >= this.items.length) {
      index = 0;
    }
    return index;
  }

  private scrollContainer() {
    if (this.scrollableArea && this.scrollableArea.nativeElement) {
      const scrollContainer = this.scrollableArea.nativeElement.parentElement.parentElement;
      return scrollContainer.classList.contains('ps') ? scrollContainer : null;
    }
    return null;
  }

  private scrollTo(item: ListItem) {
    if (this.scrollContainer()) {
      let itemElement = this.scrollableArea.nativeElement.querySelector('.lookup-item[itemId="' + item.id + '"]');
      if (itemElement) {
        let height = 0;
        while (itemElement !== null) {
          height += itemElement.offsetHeight || 0;
          itemElement = itemElement.previousSibling;
        }
        this.scrollContainer().scrollTop = height - 100;
      }
    }
  }

  private updateScrollBars() {
    if (this.scrollComponent) {
      this.scrollComponent.directiveRef.update();
    }
  }

  private createSearchConfiguration(showAll = false) {
    return {
      searchCaseSensitive: this.searchCaseSensitive,
      searchFromStartOnly: this.searchFromStartOnly,
      highlightSubstring: this.highlightSubstring,
      maxlength: this.maxlength,
      translation: this.translation,
      escapeHtml: this.escapeHtml,
      showAll,
      queryMinSymbolsCount: this.queryMinSymbolsCount
    };
  }

  private createFilteredItem(item: ListItem, query: string, caseSensitive: boolean = false) {
    let pre = '';
    let post = '';
    let highlighted = '';
    if (query) {
      const substrFound = caseSensitive ? item.text.includes(query) : item.text.toUpperCase().includes(query.toUpperCase());
      const startIndex = caseSensitive ? item.text.indexOf(query) : item.text.toUpperCase().indexOf(query.toUpperCase());
      if (substrFound) {
        pre = item.text.substring(0, startIndex);
        highlighted = item.text.substring(startIndex, startIndex + query.length);
        post = item.text.substring(startIndex + query.length);
      } else {
        post = item.text;
      }
    } else {
      post = item.text;
    }
    return new SubstringHighlightedItem(item, pre, post, highlighted);
  }

}

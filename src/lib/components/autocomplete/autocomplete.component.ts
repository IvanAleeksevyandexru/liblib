import { Component, EventEmitter, forwardRef, ElementRef, Input, Output,
  OnInit, DoCheck, ViewChild, ChangeDetectorRef, Optional, Host, SkipSelf } from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteSuggestion, AutocompleteSuggestionProvider } from '../../models/dropdown.model';
import { HelperService } from '../../services/helper/helper.service';
import { ConstantsService } from '../../services/constants.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { FocusManager } from '../../services/focus/focus.manager';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { from, Observable } from 'rxjs';
import { Translation } from '../../models/common-enums';

@Component({
  selector: 'lib-autocomplete',
  templateUrl: 'autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteComponent),
    multi: true
  }]
})
export class AutocompleteComponent implements OnInit, DoCheck, ControlValueAccessor, Validated {

  constructor(
    private focusManager: FocusManager,
    private changeDetector: ChangeDetectorRef,
    private positioningManager: PositioningManager,
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // дополнительный класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string = ValidationShowOn.TOUCHED;
  @Input() public maxlength?: number;
  @Input() public commitOnInput = false;
  @Input() public showMagnifyingGlass = true;
  @Input() public clearable = false;
  @Input() public translation: Translation | string = Translation.NONE;
  @Input() public escapeHtml = true;
  @Input() public containerOverlap = false;
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  @Input() public queryMinSymbolsCount = 1;
  @Input() public searchOnFocus = false;
  @Input() public progressive = false; // предлагаем новые продолженные подсказки сразу как подсказка была выбрана
  @Input() public autocompleteSuggestionProvider: AutocompleteSuggestionProvider;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public autocompleted = new EventEmitter<AutocompleteSuggestion>();
  @Output() public cleared = new EventEmitter<void>();

  @ViewChild('scrollableArea', {static: false}) private scrollableArea: ElementRef;
  @ViewChild('scrollComponent', {static: false}) private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('searchBar', {static: false}) public searchBar: SearchBarComponent;
  @ViewChild('dropdownField', {static: false}) private valuesContainer: ElementRef;
  @ViewChild('dropdownList', {static: false}) private listContainer: ElementRef;

  public query = '';
  public searching = false;
  public expanded = false;
  public progressiveSearchTimeout = null;
  public suggestions: Array<AutocompleteSuggestion> = [];
  public highlighted: AutocompleteSuggestion = null;
  public control: AbstractControl;
  public positioningDescriptor: PositioningRequest = null;
  private insureSearchActiveToken = 0;

  private onTouchedCallback: () => void;
  private commit(value: any) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control[this.formControlName] : null;
  }

  public ngDoCheck() {
    if (this.searchBar) {
      if (this.control) {
        this.searchBar.setTouched(this.control.touched);
      }
      this.searchBar.ngDoCheck();
    }
  }

  public openDropdown() {
    if (!this.disabled && !this.expanded && this.suggestions.length) {
      this.expanded = true;
      this.highlighted = null;
      this.changeDetector.detectChanges();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.valuesContainer, slave: this.listContainer,
          destroyOnScroll: true, destroyCallback: this.closeDropdown.bind(this)} as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
      this.updateScrollBars();
    } else {
      this.changeDetector.detectChanges();
    }
  }

  public closeDropdown() {
    this.expanded = false;
    if (this.containerOverlap) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
  }

  public returnFocus(e?: Event) {
    this.searchBar.returnFocus(e);
  }

  public selectSuggestion(suggestion: AutocompleteSuggestion) {
    this.cancelSearch();
    this.returnFocus();
    this.query = HelperService.htmlToText(suggestion.text);
    if (this.progressive) {
      this.progressiveSearchTimeout = setTimeout(() => {
        this.lookupItems(this.query);
      }, 100); // тамийнг необходим чтобы дать возможность обработчику commit/emit отменить назначенный поиск
    } else {
      this.closeDropdown();
    }
    this.commit(this.query);
    this.autocompleted.emit(suggestion.originalItem);
    this.changeDetector.detectChanges();
  }

  public handleInput(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
    if (this.commitOnInput) {
      this.commit(this.query);
    }
    if (this.query.length < this.queryMinSymbolsCount) {
      this.closeDropdown();
    }
  }

  public handleChange(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
    if (!this.commitOnInput) {
      this.commit(this.query);
    }
  }

  public handleFocus() {
    this.focus.emit();
  }

  public handleBlur(raisedByOutsideClick = false) {
    this.cancelSearch();
    this.closeDropdown();
    if (raisedByOutsideClick) {
      this.focusManager.notifyFocusMayLost(this.searchBar);
    } else {
      this.blur.emit();
    }
  }

  public cancelSearch() {
    this.searchBar.cancelSearch();
    this.insureSearchActiveToken = ++this.insureSearchActiveToken % 1000;
    if (this.progressiveSearchTimeout) {
      clearTimeout(this.progressiveSearchTimeout);
      this.progressiveSearchTimeout = null;
    }
    this.searching = false;
  }

  public cancelSearchAndClose() {
    this.cancelSearch();
    this.closeDropdown();
    this.changeDetector.markForCheck();
  }

  public lookupItemsOrClose() {
    if (this.focusManager.isJustFocused(this.searchBar)) {
      return;  // будет обработано focus обработчиком ИЛИ была кликнута иконка
    }
    if (this.expanded) {
      this.closeDropdown();
    } else {
      if (!this.disabled) {
        this.lookupItems(this.query);
      }
    }
  }

  public lookupItems(query: string) {
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.progressiveSearchTimeout = null;
    if (!this.autocompleteSuggestionProvider || this.searching || query.length < this.queryMinSymbolsCount) {
      return;
    }
    const promiseOrObservable = this.autocompleteSuggestionProvider.search(query, this.createSearchConfiguration());
    this.searching = true;
    const activeSearch = promiseOrObservable instanceof Promise ?
      from(promiseOrObservable) : promiseOrObservable as Observable<Array<string | any>>;
    ((activeToken) => {
      activeSearch.subscribe((suggestions: Array<string | any>) => {
        this.searching = false;
        if (this.insureSearchActiveToken !== activeToken) {
          return; // не обрабатывать если поиск потерял актуальность (был отменен)
        }
        this.suggestions = (suggestions || []).map((suggestion) => new AutocompleteSuggestion(suggestion, suggestion));
        if (this.suggestions.length) {
          this.openDropdown();
        } else {
          this.closeDropdown();
        }
      }, e => {
        console.error(e);
        this.expanded = this.searching = false;
      });
    })(this.insureSearchActiveToken);
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    const highlightedElementIndex = this.suggestions.findIndex((suggestion: AutocompleteSuggestion) => suggestion === this.highlighted);
    if (e.key === 'Tab') {  // tab
      // blur, выходим без default preventing, дропдаун прячется чтобы ползунок скролла не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // enter
      if (this.expanded && this.highlighted) {
        this.selectSuggestion(this.highlighted);
      } else {
        this.lookupItemsOrClose();
      }
    } else if (e.key === 'ArrowUp') { // up
      if (this.expanded) {
        const prevItemIndex = this.findNextNavigationItem(highlightedElementIndex, false);
        this.highlighted = this.suggestions.length ? this.suggestions[prevItemIndex] : null;
        this.scrollTo(prevItemIndex);
      }
    } else if (e.key === 'ArrowDown') {  // down
      if (this.expanded) {
        const nextItemIndex = this.findNextNavigationItem(highlightedElementIndex, true);
        this.highlighted = this.suggestions.length ? this.suggestions[nextItemIndex] : null;
        this.scrollTo(nextItemIndex);
      }
    } else if (e.key === 'Escape') { // escape
      this.closeDropdown();
    }
  }

  public highlight(suggestion: AutocompleteSuggestion) {
    this.highlighted = suggestion;
  }

  public writeValue(value: string) {
    this.query = value === null || value === undefined ? '' : value;
    this.changeDetector.detectChanges();
    if (this.expanded) {
      this.lookupItems(this.query);
    }
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

  private createSearchConfiguration() {
    return {
      progressive: this.progressive,
      maxlength: this.maxlength,
      escapeHtml: this.escapeHtml,
      translation: this.translation,
      queryMinSymbolsCount: this.queryMinSymbolsCount
    };
  }

  private findNextNavigationItem(fromIndex: number, directionForward: boolean) {
    let index = fromIndex === -1 && !directionForward ? 0 : fromIndex;
    index = directionForward ? ++index : --index;
    if (index < 0) {
      index = this.suggestions.length - 1;
    } else if (index >= this.suggestions.length) {
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

  private scrollTo(suggestionIndex: number) {
    if (this.scrollContainer()) {
      let itemElement = this.scrollableArea.nativeElement.children[suggestionIndex];
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

}

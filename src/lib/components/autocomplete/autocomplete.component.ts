import { Component, EventEmitter, forwardRef, ElementRef, Input, Output,
  OnInit, DoCheck, ViewChild, ChangeDetectorRef, Optional, Host, Self, SkipSelf } from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteSuggestion,
  AutocompleteSuggestionProvider, AutocompleteSuggestionPartialProvider } from '../../models/dropdown.model';
import { HelperService } from '../../services/helper/helper.service';
import { ConstantsService } from '../../services/constants.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { VirtualScrollComponent } from '../virtual-scroll/virtual-scroll.component';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { Translation, LineBreak } from '../../models/common-enums';
import { FocusManager } from '../../services/focus/focus.manager';
import { ListItemsService, ListItemsVirtualScrollController } from '../../services/list-item/list-items.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { Width } from '../../models/width-height';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'lib-autocomplete',
  templateUrl: 'autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteComponent),
    multi: true
  }, ListItemsService]
})
export class AutocompleteComponent implements OnInit, DoCheck, ControlValueAccessor, Validated {

  constructor(
    private focusManager: FocusManager,
    private changeDetector: ChangeDetectorRef,
    private positioningManager: PositioningManager,
    @Self() protected listService: ListItemsService,
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // дополнительный класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public maxlength?: number;
  @Input() public commitOnInput = false;
  @Input() public width?: string | Width;
  // показ лупы
  @Input() public showMagnifyingGlass = true;
  // показ крутилки во время поиска
  @Input() public showSearching = true;
  // крестик очистки при наличии значения
  @Input() public clearable = false;
  // показ выпадашки со значением "не найдено" если результат поиска пустой (вкл), отсутствие выпадашки (выкл)
  @Input() public showNotFound = false;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = true;
  // подсвечивать найденную строку в результатах
  @Input() public highlightSubstring = false;
  // показывать ... вместо найденной подстроки в результатах
  @Input() public truncateSubstring = false;
  // показ предложения окончания фразы в поле ввода (соответствующий первому подходящему варианту)
  @Input() public showSuggestion = false;
  // позиционировать выпадающий список программно на fixed координатах (выпадашка может выходить за пределы диалоговых окон)
  @Input() public containerOverlap = false;
  // отделить выпадающее меню и смещать вправо по позиции курсора ввода
  @Input() public contextMenuPosition = false;
  // ожидание (мс) до срабатывания поиска с последнего ввода символа
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  // минимально необходимое количество символов для срабатывания поиска
  @Input() public queryMinSymbolsCount = 1;
  // запуск поиска по приобретению фокуса при наличии значения
  @Input() public searchOnFocus = false;
  // срабатывание нового поиска сразу после выбора подсказки из списка
  @Input() public progressive = false;
  // параметр поиска, перевод (виджет не переводит итемы, но передает провайдеру информацию о необходимости перевода)
  @Input() public translation: Translation | string = Translation.NONE;
  // источник значений для поиска
  @Input() public suggestionsProvider: AutocompleteSuggestionProvider | AutocompleteSuggestionPartialProvider;
  // постраничная подгрузка итемов в результатах и размер блока
  @Input() public incrementalLoading = false;
  @Input() public incrementalPageSize = ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
  // смещение курсора в конце строки
  @Input() public moveFocusToEnd = false;
  // виртуальный скролл, рендерится в dom лишь отображаемая часть списка (для больших списков)
  @Input() public virtualScroll = false;
  // отключение закрытия списка по повторному клику, если список открыт
  @Input() public disableClickClosing = false;
  // блокировка открытия выпадающего списка по блюру для дадаты
  @Input() public disableOpening = false;
  // при слабом коннекте запускать поиск последнего введенного значения #dadata
  @Input() public searchLastValue = false;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  // выбор значения из списка
  @Output() public autocompleted = new EventEmitter<AutocompleteSuggestion>();
  // очистка крестиком
  @Output() public cleared = new EventEmitter<void>();
  // произведен формированный поиск ентером или кликом по лупе, поиск (стандартное действие) уже в процессе
  @Output() public forcedSearch = new EventEmitter();
  @Output() public opened = new EventEmitter();
  @Output() public closed = new EventEmitter();
  @Output() public fetched = new EventEmitter();

  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('virtualScroll') private virtualScrollComponent: VirtualScrollComponent;
  @ViewChild('searchBar', {static: false}) public searchBar: SearchBarComponent;
  @ViewChild('dropdownField', {static: false}) private valuesContainer: ElementRef;
  @ViewChild('dropdownList', {static: false}) private listContainer: ElementRef;
  @ViewChild('additionalItem', {static: false}) private additionalItem: ElementRef;

  public query = '';
  public activeQuery = '';
  public searching = false;
  public expanded = false;
  public partialPageNumber = 0;
  public partialsLoading = false;
  public partialsLoaded = false;
  public progressiveSearchTimeout = null;
  public suggestions: Array<AutocompleteSuggestion> = [];
  public highlighted: AutocompleteSuggestion = null;
  public suggestion: string;
  public suggested: AutocompleteSuggestion;
  public suggestionJustSelected = false;
  public control: AbstractControl;
  public positioningDescriptor: PositioningRequest = null;
  public virtualScrollController = new ListItemsVirtualScrollController(this.getRenderedItems.bind(this));
  public LineBreak = LineBreak;
  private insureSearchActiveToken = 0;
  public modelChanged = false;

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
    if (!this.disableOpening && !this.disabled && !this.expanded && (this.suggestions.length || this.additionalItem.nativeElement.children?.length || this.showNotFound)) {
      this.expanded = true;
      this.highlighted = null;
      this.changeDetector.detectChanges();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.valuesContainer, slave: this.listContainer,
          destroyOnScroll: true, destroyCallback: this.closeDropdown.bind(this)} as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
      this.opened.emit();
      this.modelChanged = false;
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
    this.closed.emit();
  }

  public returnFocus(e?: Event) {
    this.searchBar.returnFocus(e);
  }

  public selectSuggestion(suggestion: AutocompleteSuggestion) {
    this.cancelSearch();
    this.returnFocus();
    if (!suggestion || !this.listService.isSelectable(suggestion)) {
      return;
    }
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

  public handleBlur() {
    this.cancelSearchAndClose();
    this.blur.emit();
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
    if (this.moveFocusToEnd && !this.expanded && !this.disabled) {
      this.searchBar.putCursorAtEnd();
    }
    if (this.focusManager.isJustFocused(this.searchBar)) {
      return;  // будет обработано focus обработчиком ИЛИ была кликнута иконка
    }
    if (this.expanded) {
      if (!this.disableClickClosing) {
        this.closeDropdown();
      }
    } else {
      if (!this.disabled) {
        this.lookupItems(this.query);
        this.forcedSearch.emit();
      }
    }
  }

  public lookupItems(query: string) {
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    // не делать запрос, если не изменилась модель
    if (!this.modelChanged) {
      if (this.suggestions.length || this.additionalItem.nativeElement.children.length || this.showNotFound) {
        this.openDropdown();
      } else {
        this.closeDropdown();
      }
      return;
    }
    if (!this.suggestionsProvider || query.length < this.queryMinSymbolsCount) {
      this.cancelSearchAndClose();
      return;
    }
    this.progressiveSearchTimeout = null;
    this.partialPageNumber = 0;
    this.partialsLoaded = false;
    this.runSearchOrIncrementalSearch(true, query, () => {
      if (this.suggestions.length || this.additionalItem.nativeElement.children.length || this.showNotFound) {
        this.updateSuggestion(query);
        this.openDropdown();
      } else {
        this.closeDropdown();
      }
    });
  }

  public loadNextPartial() {
    if (this.incrementalLoading && !this.partialsLoaded && this.expanded) {
      this.runSearchOrIncrementalSearch(false, this.activeQuery);
    }
  }

  public runSearchOrIncrementalSearch(rootSearch: boolean, query: string, callback?: () => void) {
    if (rootSearch && this.searching || !rootSearch && (this.searching || this.partialsLoading)) {
      return;
    }
    const config = this.createSearchConfiguration();
    let promiseOrObservable = null;
    if (this.incrementalLoading) {
      promiseOrObservable = (this.suggestionsProvider as AutocompleteSuggestionPartialProvider)
        .searchPartial(query, this.partialPageNumber, config);
    } else {
      promiseOrObservable = (this.suggestionsProvider as AutocompleteSuggestionProvider).search(query, config);
    }
    const activeSearch = promiseOrObservable instanceof Promise ?
      from(promiseOrObservable) : promiseOrObservable as Observable<Array<string | any>>;
    this.activeQuery = query;
    rootSearch ? this.searching = true : this.partialsLoading = true;
    ((activeToken) => {
      activeSearch.subscribe((suggestions: Array<string | any>) => {
        this.searching = this.partialsLoading = false;
        if (this.insureSearchActiveToken === activeToken) {
          this.processSuggestions(rootSearch, suggestions, callback);
        }
        this.fetched.emit();
        this.changeDetector.detectChanges();
      }, e => {
        console.error(e);
        this.searching = this.partialsLoading = false;
        this.closeDropdown();
      });
    })(this.insureSearchActiveToken);
    this.changeDetector.detectChanges();
  }

  public processSuggestions(rootSearch: boolean, suggestions: Array<string | any>, callback?: () => void) {
    const newSuggestions = (suggestions || []).map((suggestion) => {
      return suggestion instanceof AutocompleteSuggestion ?
        suggestion as AutocompleteSuggestion : new AutocompleteSuggestion(suggestion, suggestion);
    });
    if (this.highlightSubstring || this.truncateSubstring) {
      newSuggestions.forEach((suggestion: AutocompleteSuggestion) => {
        suggestion.prepareHighlighting(this.activeQuery, false, this.truncateSubstring);
      });
    }
    if (this.incrementalLoading) {
      if (newSuggestions.length) {
        this.suggestions = rootSearch ? newSuggestions : this.suggestions.concat(newSuggestions);
        this.partialPageNumber++;
      } else {
        this.partialsLoaded = true;
      }
    } else {
      this.suggestions = newSuggestions;
    }
    const done = callback ? callback : () => {};
    if (this.virtualScroll && this.valuesContainer) {
      return this.listService.evaluateItemsSizeAsync(newSuggestions, this.valuesContainer.nativeElement.clientWidth, {}).subscribe(() => {
        this.updateScrollHeight();
        done();
      });
    } else {
      done();
    }
  }

  public getRenderedItems() {
    return this.suggestions || [];
  }

  public updateSuggestion(query: string, item?: AutocompleteSuggestion) {
    let suggestedItem = item;
    const check = (suggested: AutocompleteSuggestion) => {
      const txt = suggested.text;
      const containsQuery = txt.toUpperCase().startsWith(query.toUpperCase());
      return this.listService.isSelectable(suggested) && containsQuery;
    };
    if (!suggestedItem) {
      suggestedItem = (this.suggestions || []).find(check);
    }
    if (this.showSuggestion && suggestedItem && check(suggestedItem)) {
      this.suggested = suggestedItem;
      const suggestion = suggestedItem.text.substring(query.length);
      this.suggestion = suggestion ? suggestion.replace(/\s/g, '&nbsp;') : null;
    } else {
      this.clearTextSuggestion();
    }
  }

  public updateScrollHeight() {
    if (this.virtualScroll && this.virtualScrollComponent) {
      const suggestions = this.suggestions || [];
      const totalContentSize = suggestions.reduce((acc, item) => acc + item.getItemHeight(), 0);
      this.virtualScrollComponent.setTotalContentSize(totalContentSize);
    }
  }

  public selectTextSuggestion(suggestion: string) {
    if (this.suggested) {
      this.selectSuggestion(this.suggested);
    } else {
      this.clearTextSuggestion();
    }
    this.suggestionJustSelected = true;
  }

  public clearTextSuggestion() {
    this.suggestion = this.suggested = null;
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    if (e.key === 'Tab') {  // tab
      // blur, выходим без default preventing, дропдаун прячется чтобы ползунок скролла не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // enter
      if (this.suggestionJustSelected) {
        this.suggestionJustSelected = false;
        return;
      }
      if (this.expanded && this.highlighted && !this.highlighted.unselectable) {
        this.selectSuggestion(this.highlighted);
      } else {
        this.lookupItemsOrClose();
      }
    } else if (e.key === 'Escape') { // escape
      this.closeDropdown();
    } else if (this.expanded) { // стрелки
      const navResult = this.listService.handleKeyboardNavigation(
        e, this.suggestions, this.highlighted, this.virtualScrollComponent || this.scrollComponent);
      if (navResult && navResult !== true) {
        this.highlighted = navResult as AutocompleteSuggestion;
      }
    }
  }

  public highlight(suggestion: AutocompleteSuggestion) {
    if (suggestion && this.listService.isHighlightable(suggestion)) {
      this.updateSuggestion(this.activeQuery, suggestion);
      this.highlighted = suggestion;
    } else {
      this.clearTextSuggestion();
    }
    this.changeDetector.detectChanges();
  }

  public writeValue(value: string) {
    this.query = value === null || value === undefined ? '' : value;
    this.modelChanged = true;
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
      queryMinSymbolsCount: this.queryMinSymbolsCount,
      partialPageSize: this.incrementalPageSize
    };
  }

}

import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Host,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  Self,
  SimpleChanges,
  SkipSelf,
  ViewChild
} from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { FocusManager } from '../../services/focus/focus.manager';
import { InconsistentReaction, LineBreak, Translation } from '../../models/common-enums';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import {
  FixedItemsProvider,
  ListItemsOperationsContext,
  ListItemsService,
  ListItemsVirtualScrollController
} from '../../services/list-item/list-items.service';
import {
  ListElement,
  ListItem,
  ListItemConverter,
  LookupPartialProvider,
  LookupProvider
} from '../../models/dropdown.model';
import { ConstantsService } from '../../services/constants.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { VirtualScrollComponent } from '../virtual-scroll/virtual-scroll.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { Width } from '../../models/width-height';
import { Suggest, SuggestItem } from '../../models/suggest';

const SHOW_ALL_MARKER = {};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-lookup',
  templateUrl: 'lookup.component.html',
  styleUrls: ['./lookup.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LookupComponent),
    multi: true
  }, ListItemsService]
})
export class LookupComponent implements OnInit, AfterViewInit, OnChanges, ControlValueAccessor, Validated {

  constructor(
    private changeDetector: ChangeDetectorRef,
    private positioningManager: PositioningManager,
    protected focusManager: FocusManager,
    @Self() protected listService: ListItemsService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер разметки для deep классов
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled = false;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public maxlength?: number;
  @Input() public placeholder?: string;
  @Input() public width?: Width | string;
  @Input() public cachedResponse?: boolean;
  @Input() public staticList?: boolean;
  @Input() public suggest?: Suggest;


  // фукнция форматирования для итема (общая, действует на итем и в поле и в списке)
  @Input() public formatter?: (item: ListItem, context: { [name: string]: any }) => string;
  // функция форматирования специальная, применяется только в списке для случая когда отображение в списке должно отличаться
  @Input() public listFormatter?: (item: ListItem, context: { [name: string]: any }) => string;
  // конвертер объединяет входной и выходной конвертер для объектов не подходящих под интерфейс {id, text}
  @Input() public converter?: ListItemConverter;

  // показ лупы
  @Input() public showMagnifyingGlass = true;
  // показ крутилки во время поиска
  @Input() public showSearching = true;
  // крестик очистки при наличии значения
  @Input() public clearable = false;
  // показ выпадашки со значением "не найдено" если результат поиска пустой (вкл), отсутствие выпадашки (выкл)
  @Input() public showNotFound = false;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = false;
  // перевод итемов виджетом (в этом случае .text это код транслитерации)
  @Input() public translation: Translation | string = Translation.NONE;
  // подсвечивать найденную строку в результатах
  @Input() public highlightSubstring = true;
  // показывать ... вместо найденной подстроки в результатах
  @Input() public truncateSubstring = false;
  // показ предложения окончания фразы в поле ввода (соответствующий первому подходящему варианту)
  @Input() public showSuggestion = false;
  // позиционировать выпадающий список программно на fixed координатах (выпадашка может выходить за пределы диалоговых окон)
  @Input() public containerOverlap = false;
  // отделить выпадающее меню и смещать вправо по позиции курсора ввода
  @Input() public contextMenuPosition = false;
  // добавление кнопки как у дропдауна для отображения всех имеющихся вариантов (поиск по '')
  @Input() public showExpandCollapse = false;
  // реакция на оставление поля с текстом не соответствующим выбранному варианту (нарушение консистентности)
  @Input() public clearInconsistent: InconsistentReaction | string = InconsistentReaction.RESTORE;

  // ожидание (мс) до срабатывания поиска с последнего ввода символа
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  // минимально необходимое количество символов для срабатывания поиска
  @Input() public queryMinSymbolsCount = 1;
  // запуск поиска по приобретению фокуса при наличии значения
  @Input() public searchOnFocus = false;
  // параметры поиска: поиск только с начала текстового значения
  @Input() public searchFromStartOnly = false;
  // параметры поиска: чувствительность к регистру
  @Input() public searchCaseSensitive = true;
  // постраничная подгрузка итемов в результатах и размер блока
  @Input() public incrementalLoading = false;
  @Input() public incrementalPageSize = ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
  // виртуальный скролл, рендерится в dom лишь отображаемая часть списка (для больших списков)
  @Input() public virtualScroll = false;
  // включает возможность сворачивать-разворачивать группы элементов, tree-like view
  @Input() public collapsableGroups = false;
  // включает-отключает возможность выбирать группировочные элементы
  @Input() public virtualGroups = true;

  // источник значений в виде фиксированного списка
  // ListElement-ы лукап может использовать нативно, any работает через конвертер
  @Input() public fixedItems: Array<ListElement | any> = [];
  // источник значений в виде внешнего провайдера с полностью независимой возможно асинхронной логикой работы
  @Input() public itemsProvider: LookupProvider<ListElement | any> | LookupPartialProvider<ListElement | any>;
  // новый вид для ультрановой главной
  @Input() public mainPageStyle: boolean = false;
  // скрывать результат поиска в независимости от наличия ответа
  @Input() public hideSearchResult: boolean = false;
  // заблокированное значение для "умного" поиска в случае, если пользователь начал отвечать на предложенный квиз
  @Input() public blockedSearchValue = '';
  // активация автоматического перевода с английского
  @Input() public enableLangConvert = false;
  // Остановка запросов к спутник апи в случае, если пользователь вошел в чат с Цифровым Ассистентом
  @Input() public stopSearch = false;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  // новое значение выбрано
  @Output() public changed = new EventEmitter<ListItem>();
  // сброс значения крестиком
  @Output() public cleared = new EventEmitter();
  // произведен форсированный поиск ентером или кликом по лупе, поиск (стандартное действие) уже в процессе
  @Output() public forcedSearch = new EventEmitter<any>();
  @Output() public opened = new EventEmitter();
  @Output() public closed = new EventEmitter();
  @Output() public listed = new EventEmitter<Array<ListItem>>();
  @Output() public queryChanged = new EventEmitter<string>();
  @Output() public enterKeyEvent = new EventEmitter();
  @Output() public searchButtonClick = new EventEmitter<string>();
  @Output() public blockedSearchClear = new EventEmitter();
  @Output() public selectSuggest = new EventEmitter<Suggest | SuggestItem>();


  public internalFixedItems: Array<ListItem> = [];
  public internalItem: ListItem;
  public item: ListItem;

  // непосредственно показываемые итемы списка
  public items: Array<ListItem> = [];
  public highlighted: ListItem = null;

  public query = '';
  public activeQuery: string | {};
  public searching = false;
  public expanded = false;
  public invalidDisplayed = false;
  public positioningDescriptor: PositioningRequest = null;
  public forceShowStatic = false;
  public partialPageNumber = 0;
  public partialsLoading = false;
  public partialsLoaded = false;
  public htmlPlaceholder: string;
  public control: AbstractControl;
  public suggestion: string;
  public suggested: ListItem;
  public suggestionJustSelected = false;
  public virtualScrollController = new ListItemsVirtualScrollController(this.getRenderedItems.bind(this));
  public LineBreak = LineBreak;
  private insureSearchActiveToken = 0;
  // компонент может работать на заданном фиксированном списке значений или не внешнем поиске
  public fixedItemsProvider = new FixedItemsProvider();
  public prevQuery: string;

  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('virtualScroll') private virtualScrollComponent: VirtualScrollComponent;
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
    const updateKeys = ['formatter', 'listFormatter', 'converter', 'translation', 'virtualScroll'];
    const setItemsKeys = ['itemsProvider', 'fixedItems'];
    const keys = Object.keys(changes);
    if (updateKeys.some((updateKey) => keys.includes(updateKey))) {
      this.update();
    } else if (setItemsKeys.some((setItemsKey) => keys.includes(setItemsKey))) {
      this.setItems(this.itemsProvider ? [] : this.fixedItems, !!this.itemsProvider);
    }
    this.check();
  }

  public update() {
    this.listService.synchronizeOperationsContext({
      formatter: this.formatter,
      converter: this.converter,
      translation: this.translation,
      onLanguageChange: () => this.updateFormatting(),
      highlightSubstring: this.highlightSubstring || this.truncateSubstring,
      highlightCaseSensitive: this.searchCaseSensitive,
      highligthFromStartOnly: this.searchFromStartOnly || this.truncateSubstring,
      collapsableGroups: this.collapsableGroups,
      virtualGroups: this.virtualGroups,
      virtualScroll: this.virtualScroll
    } as ListItemsOperationsContext);
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

  public modelChange(): void {
    this.queryChanged.emit(this.searchBar.query);
  }

  public clearInput(): void {
    if (!this.disabled) {
      this.selectItem(null);
      this.queryChanged.emit('');
      this.cleared.emit();
    }
  }

  public restoreQuery() {
    this.query = this.item ? this.item.textFormatted : '';
  }

  public cancelSearch() {
    this.searchBar.cancelSearch();
    this.insureSearchActiveToken = ++this.insureSearchActiveToken % 1000;
    this.searching = false;
  }

  public cancelSearchAndClose(blurEvent = false) {
    this.cancelSearch();
    if (!this.mainPageStyle || !blurEvent) {
      this.closeDropdown();
    }
    this.changeDetector.markForCheck();
  }

  public handleBlur() {
    if (!this.mainPageStyle) {
      setTimeout(() => this.cancelSearchAndClose(), 15);
    }
    this.resetItemIfNotConsistent();
    this.blur.emit();
  }

  public handleFocus() {
    this.showTextField();
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }

    this.focus.emit();
  }

  public setSearchBarFocus(setSearchValue?): void {
    if (setSearchValue) {
      this.query = setSearchValue;
      this.searchBar.setSearchValueFromParent(setSearchValue);

    }
    this.searchBar.inputElement.nativeElement.focus();
  }

  public returnFocus(e?: Event) {
    this.searchBar.returnFocus(e);
  }

  public setItems(value: Array<any>, consistencyCheck = true) {
    this.prepareItems(value, 0, null, false, true, (newItems: Array<ListItem>) => {
      this.internalFixedItems = newItems;
      this.items = [];
      if (consistencyCheck && this.item) {
        this.item = this.item.findSame(this.internalFixedItems, true);
        this.restoreQuery();
      }
    });
    this.closeDropdown();
  }

  public selectItem(item: ListItem, passive = false) {
    let isNew = true;
    if (!this.mainPageStyle) {
      this.returnFocus();
      if (item && !this.listService.isSelectable(item)) {
        return;
      }
      if (!passive) {
        this.forceShowStatic = true;
      }
      this.cancelSearch();
      isNew = !ListItem.compare(this.item, item);
      this.item = item;
      this.restoreQuery();
    }
    if (isNew) {
      const outputValue = this.listService.restoreOriginal(item);
      this.commit(outputValue);
      this.changed.emit(outputValue);
    }
    this.closeDropdown();
  }

  public lookupItemsOrClose(showAll = false) {
    if (this.disabled) {
      return;
    }
    if (this.expanded) {
      this.closeDropdown();
    } else {
      this.showTextField();
      if (!this.mainPageStyle) {
        this.lookupItems(showAll ? SHOW_ALL_MARKER : this.query);
      }
    }
  }

  public forceSearch(query: string, byEnter = false) {
    if (!byEnter || !(this.expanded && this.highlighted)) {
      this.forcedSearch.emit({query, byEnter});
    }
  }

  public lookupItems(queryOrMarker: string | {}) {
    if (queryOrMarker !== SHOW_ALL_MARKER && (queryOrMarker as string).length < this.queryMinSymbolsCount) {
      this.cancelSearchAndClose();
      return;
    }
    this.partialPageNumber = 0;
    this.partialsLoaded = false;
    this.runSearchOrIncrementalSearch(true, queryOrMarker, () => {
      if (this.items.length || this.showNotFound) {
        this.updateSuggestion(queryOrMarker);
        this.openDropdown();
      } else {
        this.closeDropdown();
      }
    });
  }

  public getRenderedItems() {
    return this.items || [];
  }

  public loadNextPartial() {
    if (this.incrementalLoading && !this.partialsLoaded && this.expanded) {
      this.runSearchOrIncrementalSearch(false, this.activeQuery);
    }
  }

  public runSearchOrIncrementalSearch(rootSearch: boolean, queryOrMarker: string | {}, callback?: () => void) {
    if (rootSearch && this.searching || !rootSearch && (this.searching || this.partialsLoading)) {
      return;
    }

    const provider = this.itemsProvider ? this.itemsProvider : this.fixedItemsProvider.setSource(this.internalFixedItems);
    const config = this.createSearchConfiguration(queryOrMarker === SHOW_ALL_MARKER);
    const query = queryOrMarker === SHOW_ALL_MARKER ? '' : queryOrMarker as string;
    let promiseOrObservable = null;
    if (this.incrementalLoading) {
      promiseOrObservable = (provider as LookupPartialProvider).searchPartial(query, this.partialPageNumber, config);
    } else {
      if (this.prevQuery === this.query && this.cachedResponse) {
        this.openDropdown();
        return;
      }
      promiseOrObservable = (provider as LookupProvider).search(query, config);
    }
    const activeSearch = promiseOrObservable instanceof Promise ?
      from(promiseOrObservable) : promiseOrObservable as Observable<Array<any>>;
    this.activeQuery = queryOrMarker;
    if (rootSearch) {
      this.searching = true;
    } else {
      this.partialsLoading = true;
    }
    ((activeToken) => {
      activeSearch.subscribe((items: Array<any>) => {
        this.prevQuery = this.query;
        this.searching = this.partialsLoading = false;
        if (this.insureSearchActiveToken === activeToken) {
          this.processNewItems(rootSearch, items);
          if (callback) {
            callback();
          }
        }
        this.changeDetector.detectChanges();
      }, e => {
        console.error(e);
        this.searching = this.partialsLoading = false;
        this.closeDropdown();
      });
    })(this.insureSearchActiveToken);
    this.changeDetector.detectChanges();
  }

  // все что prepareItems + запись в список отображения
  public processNewItems(rootSearch: boolean, items: Array<any>) {
    this.prepareItems(items, this.items.length, this.activeQuery, false, !!this.itemsProvider, (newItems: Array<ListItem>) => {
      if (this.incrementalLoading) {
        if (newItems.length) {
          this.items = rootSearch ? newItems : this.items.concat(newItems);
          this.partialPageNumber++;
        } else {
          this.partialsLoaded = true;
        }
      } else {
        this.items = newItems;
      }
      this.listService.alignGroupsTreeIfNeeded(this.items, this.itemsProvider ? this.items : this.internalFixedItems);
      this.updateScrollHeight();
      this.listed.emit(this.items);
    });
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
      this.opened.emit();
    }
  }

  public closeDropdown() {
    this.expanded = false;
    if (this.containerOverlap) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
    this.highlighted = null;
    this.clearSuggestion();
    this.closed.emit();
    this.changeDetector.markForCheck();
  }

  public showTextField() {
    this.forceShowStatic = false;
  }

  public expandCollapse(item: ListItem, evt: Event) {
    this.returnFocus();
    this.listService.expandCollapse(item, this.items, evt);
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    if (e.key === 'Tab') {  // tab
      // blur, скрывем дропдаун чтобы ползунок скролла не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // enter
      if (this.suggestionJustSelected) {
        this.suggestionJustSelected = false;
        return;
      }
      if (this.mainPageStyle && !this.searching && this.query) {
        this.enterKeyEvent.emit(this.items.length);
        if (!this.items.length) {
          return;
        }
      }
      if (this.expanded && this.highlighted && !this.highlighted.unselectable) {
        this.selectItem(this.highlighted);
      } else {
        this.lookupItemsOrClose();
      }
    } else if (e.key === 'Escape') { // escape
      this.closeDropdown();
    } else if (this.expanded) { // стрелки
      const navResult = this.listService.handleKeyboardNavigation(
        e, this.items, this.highlighted, this.virtualScrollComponent || this.scrollComponent);
      if (navResult && navResult !== true) {
        this.highlighted = navResult as ListItem;
      }
    }
  }

  public updateSuggestion(queryOrMarker: string | {}, item?: ListItem) {
    const query = queryOrMarker === SHOW_ALL_MARKER ? '' : queryOrMarker as string;
    let suggestedItem = item;
    const check = (suggested: ListItem) => {
      const txt = suggested.textFormatted;
      const containsQuery = this.searchCaseSensitive ? txt.startsWith(query) : txt.toUpperCase().startsWith(query.toUpperCase());
      return this.listService.isSelectable(suggested) && containsQuery;
    };
    if (!suggestedItem) {
      suggestedItem = (this.items || []).find(check);
    }
    if (this.showSuggestion && suggestedItem && check(suggestedItem)) {
      this.suggested = suggestedItem;
      const suggestion = suggestedItem.textFormatted.substring(query.length);
      this.suggestion = suggestion ? suggestion.replace(/\s/g, '&nbsp;') : null;
    } else {
      this.clearSuggestion();
    }
  }

  public clearSuggestion() {
    this.suggested = this.suggestion = null;
  }

  public selectSuggestion(suggestion: string) {
    if (this.suggested) {
      this.selectItem(this.suggested);
    } else {
      this.clearSuggestion();
    }
    this.suggestionJustSelected = true;
  }

  public highlight(item: ListItem, fromKeyboard = false) {
    if (!item || this.listService.isHighlightable(item, fromKeyboard)) {
      this.highlighted = item;
      if (item) {
        this.updateSuggestion(this.activeQuery, item);
      } else {
        this.clearSuggestion();
      }
    } else {
      this.clearSuggestion();
    }
  }

  /**
   * Notified when model changed
   */
  public writeValue(value: any) {
    // не провряем косистентность итема даже среди fixedItems, таков контракт
    this.clearSuggestion();
    if (value) {
      this.item = this.listService.createListItem(value);
      this.prepareItems([this.item], null, null, true, false, () => {
        this.restoreQuery();
      });
    } else {
      this.item = value;
      this.restoreQuery();
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
    this.changeDetector.detectChanges();
  }

  public updateFormatting() {
    this.prepareItems(this.internalFixedItems, 0, null, true, true);
    this.prepareItems(this.item ? [this.item] : [], null, null, true);
  }

  public updateScrollHeight() {
    if (this.virtualScroll && this.virtualScrollComponent) {
      const items = this.items || [];
      const totalContentSize = items.reduce((acc, item) => acc + item.getItemHeight(), 0);
      this.virtualScrollComponent.setTotalContentSize(totalContentSize);
    }
  }

  // конвертация, перевод, форматирование и подсветка подстроки
  private prepareItems(items: Array<any | ListItem>, initialIndex = 0, highlightQuery: string | {} | null,
                       forceTranslate = false, refreshHeight = false, callback?: (items?: Array<ListItem>) => void) {
    const query = highlightQuery === null ? null : (highlightQuery === SHOW_ALL_MARKER ? '' : highlightQuery as string);
    const indexing = {noIndex: initialIndex === null, indexBase: initialIndex || undefined};
    const newItems = this.listService.createListItems(items, indexing);
    this.listService.translateFormat(newItems, forceTranslate, indexing).subscribe((formattedItems: Array<ListItem>) => {
      this.listService.highlightSubstring(formattedItems, query);
      const done = () => {
        if (callback) {
          callback(formattedItems);
        }
        this.changeDetector.detectChanges();
      };
      if (this.virtualScroll && this.fieldContainer && refreshHeight) {
        this.listService.evaluateItemsSizeAsync(formattedItems, this.fieldContainer.nativeElement.clientWidth, {}).subscribe(done);
      } else {
        done();
      }
    });
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

  public handleSearchButtonClick(query: string): void {
    this.searchButtonClick.emit(query);
  }

  public clearBlocked(): void {
    this.blockedSearchClear.emit();
  }

  public selectSuggestItem(item: SuggestItem): void {
    this.selectSuggest.emit(item);
    this.closeDropdown();
  }

  public editSuggestList(suggest: Suggest): void {
    suggest.isEdit = true;
    this.selectSuggest.emit(suggest);
  }
}

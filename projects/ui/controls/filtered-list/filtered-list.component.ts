import {
  Component, ViewChild, Input, Output, OnInit, OnChanges, DoCheck, AfterViewInit,
  EventEmitter, ElementRef, forwardRef, SimpleChanges, ChangeDetectorRef, Optional, Host, SkipSelf, Self
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem, ListElement, ListItemConverter } from '@epgu/ui/models/dropdown';
import { of, forkJoin } from 'rxjs';
import { SearchBarComponent } from '../search-bar';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { VirtualScrollComponent } from '@epgu/ui/components/virtual-scroll';
import { Validated } from '@epgu/ui/models/validation-show';
import { ValidationHelper } from '@epgu/ui/services/validation-helper';
import { ListItemsService, FixedItemsProvider,
  ListItemsOperationsContext, ListItemsVirtualScrollController } from '@epgu/ui/services/list-item';
import { ConstantsService } from '@epgu/ui/services/constants';
import { Width, Height } from '@epgu/ui/models';
import { Translation, LineBreak, ValidationShowOn } from '@epgu/ui/models/common-enums';

@Component({
  selector: 'lib-filtered-list',
  templateUrl: 'filtered-list.component.html',
  styleUrls: ['./filtered-list.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FilteredListComponent),
    multi: true
  }, ListItemsService]
})
export class FilteredListComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, ControlValueAccessor, Validated {

  constructor(
    protected changeDetector: ChangeDetectorRef,
    @Self() protected listService: ListItemsService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public placeholder?: string;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;
  @Input() public height?: Height | string;

  // функция форматирования элемента в списке
  @Input() public formatter?: (listItem: ListItem, context?: { [name: string]: any }) => string;
  // конвертер объединяет входной и выходной конвертер для объектов не подходящих под интерфейс {id, text}
  @Input() public converter?: ListItemConverter;

  // показ лупы
  @Input() public showMagnifyingGlass = true;
  // показ крутилки во время поиска
  @Input() public showSearching = true;
  // крестик очистки при наличии значения
  @Input() public clearable = true;
  // показ значения "не найдено" если результат поиска пустой
  @Input() public showNotFound = true;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = false;
  // перевод итемов виджетом (в этом случае .text это код транслитерации)
  @Input() public translation: Translation | string = Translation.NONE;
  // подсвечивать найденную строку в результатах
  @Input() public highlightSubstring = true;
  // показ предложения окончания фразы в поле ввода (соответствующий первому подходящему варианту)
  @Input() public showSuggestion = false;
  // отфильтровывать ли итемы которые уже выбраны или оставлять их в дополнение к отфильтрованным
  @Input() public filterSelected = false;
  // мультивыбор
  @Input() public multi = true;
  // максимум выбранных
  @Input() public multipleItemsMaxSelected: number;
  // включает возможность сворачивать-разворачивать группы элементов, tree-like view
  @Input() public collapsableGroups = false;
  // определяет отношение к итемам-группам (заголовкам, элементам структуры) - можно ли их выбирать как обычные элементы
  @Input() public virtualGroups = true;
  // виртуальный скролл, рендерится в dom лишь отображаемая часть списка (для больших списков)
  @Input() public virtualScroll = false;

  // ожидание (мс) до срабатывания поиска с последнего ввода символа
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  // минимально необходимое количество символов для срабатывания поиска
  @Input() public queryMinSymbolsCount = 1;
  // параметры поиска: поиск только с начала текстового значения
  @Input() public searchFromStartOnly = false;
  // параметры поиска: чувствительность к регистру
  @Input() public searchCaseSensitive = true;

  // источник значений, массив элементов, в норме ListElement, any можно использовать через converter
  @Input() public items: Array<ListElement | any> = [];

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  // список выбранных значений изменился
  @Output() public changed = new EventEmitter<Array<any> | any>();
  // фильтрация или инкремент
  @Output() public listed = new EventEmitter<Array<ListItem>>();

  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control?: AbstractControl;
  public virtualScrollController = new ListItemsVirtualScrollController(this.getRenderedItems.bind(this), true);
  public query = '';
  public activeQuery = '';
  public LineBreak = LineBreak;
  public highlighted: ListItem;

  public itemsFilter = new FixedItemsProvider();
  public internalItems: Array<ListItem> = [];
  public filteredItems: Array<ListItem> = [];
  public internalSelected: Array<ListItem> = [];

  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('virtualScroll') private virtualScrollComponent: VirtualScrollComponent;
  @ViewChild('searchBar') private searchBar: SearchBarComponent;
  @ViewChild('itemsArea') private itemsArea: ElementRef;

  private onTouchedCallback: () => void;
  protected commit(value: Array<any> | any) {}

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    if (this.itemsArea) {
      this.itemsArea.nativeElement.querySelector('.ps__thumb-y').tabIndex = -1;
      this.evaluateItemsSizesIfNeeded(); // itemsArea до этого не появляется
    }
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    const updateKeys = ['formatter', 'listFormatter', 'translation', 'converter'];
    if (Object.keys(changes).some((changedKey) => updateKeys.includes(changedKey))) {
      this.update();
    } else if (Object.keys(changes).includes('items')) {
      this.setItems(this.items);
    }
    this.check();
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public update() {
    this.listService.synchronizeOperationsContext({
      formatter: this.formatter,
      converter: this.converter,
      translation: this.translation,
      onLanguageChange: () => this.updateFormatting(true),
      highlightSubstring: this.highlightSubstring,
      highlightCaseSensitive: this.searchCaseSensitive,
      highligthFromStartOnly: this.searchFromStartOnly,
      virtualGroups: this.virtualGroups
    } as ListItemsOperationsContext);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.check();
  }

  public setItems(value: Array<any>) {
    this.internalItems = this.listService.createListItems(value);
    this.updateFormatting();
    this.consistencyCheck();
    this.synchronizeSelected();
    this.resetFilter();
    this.changeDetector.detectChanges();
  }

  public getRenderedItems() {
    return this.filteredItems || [];
  }

  public consistencyCheck() {
    this.internalSelected = (this.internalSelected || []).filter((item: ListItem) => item.belongsTo(this.internalItems, true));
  }

  public synchronizeSelected() {
    (this.internalItems || []).forEach((item: ListItem) => {
      item.selected = item.belongsTo(this.internalSelected);
    });
    (this.filteredItems || []).forEach((item: ListItem) => {
      item.selected = item.belongsTo(this.internalSelected);
    });
  }

  public handleBlur() {
    this.focused = false;
    this.resetFilter();
    this.check();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    this.searchBar.returnFocus(e);
  }

  public applyFilter(query: string) {
    this.activeQuery = query;
    const results = query ? this.itemsFilter.setSource(this.internalItems).search(query, {
      searchFromStartOnly: this.searchFromStartOnly,
      searchCaseSensitive: this.searchCaseSensitive
    }) : of(this.internalItems);
    results.subscribe((items: Array<ListItem>) => {
      const filteredList = !this.filterSelected && query ?
        [].concat(this.internalSelected.filter((listItem: ListItem) => !listItem.belongsTo(items))).concat(items) : items;
      this.listService.highlightSubstring(filteredList, query);
      this.filteredItems = this.listService.alignGroupsTreeIfNeeded(filteredList, this.internalItems);
      this.updateScrollHeight();
      this.listed.emit(this.filteredItems);
    });
    this.highlighted = null;
  }

  public resetFilter() {
    this.query = '';
  }

  public invertSelection(item: ListItem) {
    this.returnFocus();
    if (this.disabled) {
      return;
    }
    if (item.selected) {
      this.deselectItem(item);
    } else {
      this.selectItem(item);
    }
    if (this.virtualGroups) {
      this.listService.adjustVirtualGroupsSelectionIfNeeded(this.filteredItems);
    }
    if (!this.filterSelected) {
      this.applyFilter(this.activeQuery);
    }
    this.check();
  }

  public selectItem(item: ListItem, commitEmit = true) {
    if (!item || item.unselectable || item.lineBreak === LineBreak.SELF) {
      return;
    }
    if (item.collapsable && this.virtualGroups) {
      this.listService.getTerminalItems(item, this.filteredItems).forEach((finalItem: ListItem) => this.selectItem(finalItem, false));
      this.commitEmit();
    } else {
      if (item.belongsTo(this.internalSelected) || (this.multi && this.multipleItemsMaxSelected !== undefined
        && (this.internalSelected || []).length >= this.multipleItemsMaxSelected)) {
        return;
      }
      if (this.multi) {
        this.internalSelected.push(item);
      } else {
        this.internalSelected = [item];
      }
      this.synchronizeSelected();
      if (commitEmit) {
        this.commitEmit();
      }
    }
  }

  public deselectItem(item: ListItem, commitEmit = true) {
    if (item.collapsable && this.virtualGroups) {
      this.listService.getTerminalItems(item, this.filteredItems).forEach((finalItem: ListItem) => this.deselectItem(finalItem, false));
      this.commitEmit();
    } else {
      item.selected = false;
      this.internalSelected = (this.internalSelected || []).filter((anyItem: ListItem) => !ListItem.compare(anyItem, item));
      if (commitEmit) {
        this.commitEmit();
      }
    }
  }

  public expandCollapse(item: ListItem, evt: Event) {
    this.searchBar.returnFocus();
    this.listService.expandCollapse(item, this.filteredItems, evt);
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { // ввод, пробел
      if (this.highlighted && !this.highlighted.unselectable) {
        this.invertSelection(this.highlighted);
      }
      e.preventDefault();
      e.stopPropagation();
    } else { // стрелки
      const navResult = this.listService.handleKeyboardNavigation(
        e, this.filteredItems, this.highlighted, this.virtualScrollComponent || this.scrollComponent);
      if (navResult && navResult !== true) {
        this.highlighted = navResult as ListItem;
      }
    }
  }

  public writeValue(value: Array<any> | any) {
    this.internalSelected = this.listService.createListItems(value);
    this.updateFormatting(false, false);
    this.consistencyCheck();
    this.synchronizeSelected();
    this.applyFilter(this.activeQuery);
    this.check();
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
    this.check();
  }

  public updateFormatting(forceTranslate = false, evalDimensions = true) {
    forkJoin([
      this.listService.translateFormat(this.internalItems, forceTranslate),
      this.listService.translateFormat(this.internalSelected, forceTranslate)
    ]).subscribe(() => {
      if (evalDimensions) {
        this.evaluateItemsSizesIfNeeded();
      }
      this.changeDetector.detectChanges();
    });
  }

  public evaluateItemsSizesIfNeeded() {
    if (this.virtualScroll && this.itemsArea) {
      const width = this.itemsArea.nativeElement.clientWidth;
      this.listService.evaluateItemsSizeAsync(this.internalItems, width, {multi: true}).subscribe(() => {
        this.updateScrollHeight();
      });
    }
  }

  public updateScrollHeight() {
    if (this.virtualScroll && this.virtualScrollComponent) {
      const totalContentSize = (this.filteredItems || []).reduce((acc, item) => acc + item.getItemHeight(), 0);
      this.virtualScrollComponent.setTotalContentSize(totalContentSize);
    }
  }

  public check(): void {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !(this.internalItems || []).length});
  }

  private commitEmit() {
    let output = null;
    if (this.multi) {
      output = this.listService.restoreOriginals(this.internalSelected);
    } else {
      output = this.internalSelected.length ? this.listService.restoreOriginal(this.internalSelected[0]) : null;
    }
    this.commit(output);
    this.changed.emit(output);
    this.check();
  }

}

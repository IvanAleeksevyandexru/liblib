import {
  Component, ViewChild, Input, Output, OnInit, OnChanges, DoCheck, OnDestroy, AfterViewInit,
  EventEmitter, ElementRef, forwardRef, SimpleChanges, ChangeDetectorRef, Optional, Host, SkipSelf, Self
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem, ListElement, ListItemConverter } from '../../models/dropdown.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { VirtualScrollComponent } from '../virtual-scroll/virtual-scroll.component';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { FocusManager, Focusable } from '../../services/focus/focus.manager';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { ListItemsService, ListItemsOperationsContext,
  FixedItemsProvider, ListItemsVirtualScrollController } from '../../services/list-item/list-items.service';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { ConstantsService } from '../../services/constants.service';
import { Translation, MultipleItemsLayout, LineBreak } from '../../models/common-enums';
import { Observable, forkJoin } from 'rxjs';
import { Width } from '../../models/width-height';

/*
 * документация по ссылке https://confluence.egovdev.ru/pages/viewpage.action?pageId=170673869
 */
@Component({
  selector: 'lib-dropdown',
  templateUrl: 'dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }, ListItemsService]
})
export class DropdownComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    private focusManager: FocusManager, protected changeDetector: ChangeDetectorRef, private positioningManager: PositioningManager,
    @Self() protected listService: ListItemsService, @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;

  // фукнция форматирования для итема (общая, действует на итем и в поле и в списке)
  @Input() public formatter?: (item: ListItem, context?: { [name: string]: any }) => string;
  // функция форматирования специальная, применяется только в списке для случая когда отображение в списке должно отличаться
  @Input() public listFormatter?: (item: ListItem, context?: { [name: string]: any }) => string;
  // конвертер объединяет входной и выходной конвертер для объектов не подходящих под интерфейс {id, text}
  @Input() public converter?: ListItemConverter;

  // допускает множественный выбор элементов (выпадашка не закрывается при выборе, моделью является массив)
  @Input() public multi = false;
  // крестик очистки при наличии значения: один для !multi или персональный у каждого значения для множественного выбора
  @Input() public clearable = false;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = false;
  // лейаут области поля для отображения множественных выбранных итемов + кастомный форматтер для специальных кейсов отображения
  @Input() public multipleItemsLayout: MultipleItemsLayout | string = MultipleItemsLayout.OVERFLOW;
  @Input() public customMultipleItemsLayout?: (selected: Array<ListItem>, context?: { [name: string]: any }) => Observable<string>;
  @Input() public multipleItemsMaxSelected: number;
  // заглушка для отсутствия выбранного значения/значений
  @Input() public placeholder = '&mdash;';
  // включает возможность сворачивать-разворачивать группы элементов, tree-like view
  @Input() public collapsableGroups = false;
  // определяет отношение к итемам-группам (заголовкам, элементам структуры) - можно ли их выбирать как обычные элементы
  @Input() public virtualGroups = true;

  // перевод значений при выводе (текст значения должен быть приемлемым кодом транслитерации)
  @Input() public translation: Translation | string = Translation.NONE;
  // позиционировать выпадающий список программно на fixed координатах (выпадашка может выходить за пределы диалоговых окон)
  @Input() public containerOverlap = false;
  // постраничная подгрузка итемов в результатах и размер блока
  @Input() public incrementalLoading = false;
  @Input() public incrementalPageSize = ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
  // виртуальный скролл, рендерится в dom лишь отображаемая часть списка (для больших списков)
  @Input() public virtualScroll = false;
  // включает поле поиска в выпадающую область, позволяет фильтровать отображаемые значения
  @Input() public localSearch = false;
  @Input() public highlightSubstring = true;

  // источник значений, массив элементов
  // стандарт - использование элементов ListElement которые будут автоматически приведены к ListItem
  // через конвертер можно использовать any
  @Input() public items: Array<ListElement | any> = [];

  // отображение сообщений под списком
  @Input() public additionalItem = false;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  // выбранное значение (или набор выбранных значений) изменилось
  @Output() public changed = new EventEmitter<Array<any> | any>();
  @Output() public opened = new EventEmitter<any>();
  @Output() public closed = new EventEmitter<any>();
  // пре-рендер или обновление контента выпадашки
  @Output() public listed = new EventEmitter<Array<ListItem>>();

  public expanded: boolean;
  public destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public translating = false;
  public preventOpening = false;
  public control?: AbstractControl;
  public filteringQuery = '';
  public virtualScrollController = new ListItemsVirtualScrollController(this.getRenderedItems.bind(this));
  public LineBreak = LineBreak;

  // приведенный к [ListItem] входящий список итемов +форматирование
  public internalItems: Array<ListItem> = [];
  // вырезка массива internalItems когда отображается лишь часть итемов (фильтрация, incrementalLoading)
  public internalDisplayed: Array<ListItem> = [];
  // значение модели приведенное к [ListItem]
  public internalSelected: Array<ListItem> = [];
  // кто является подсвеченным элементом (наведение мышью, выбор с клавиатуры)
  public highlighted: ListItem = null;
  public fixedItemsProvider = new FixedItemsProvider();
  public customMultipleItemsLayoutData = null;
  public positioningDescriptor: PositioningRequest = null;
  public partialPageNumber = 0;
  public partialsLoaded = false;
  public multipleItemsDetailsShown = false;

  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('virtualScroll') private virtualScrollComponent: VirtualScrollComponent;
  @ViewChild('focusableInput') private focusableInput: ElementRef;
  @ViewChild('localSearchElement') private localSearchElement: SearchBarComponent;
  @ViewChild('dropdownField', {static: false}) private valuesContainer: ElementRef;
  @ViewChild('dropdownList', {static: false}) private listContainer: ElementRef;

  private onTouchedCallback: () => void;
  protected commit(value: Array<any> | any) {}

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.destroyed) {
      return;
    }
    const updateKeys = ['formatter', 'listFormatter', 'translation', 'converter', 'items'];
    if (Object.keys(changes).some((changedKey) => updateKeys.includes(changedKey))) {
      this.update();
    }
    this.check();
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public ngOnDestroy() {
    this.focusManager.unregister(this);
    this.destroyed = true;
  }

  public update() {
    this.listService.synchronizeOperationsContext({
      formatter: this.formatter,
      listFormatter: this.listFormatter,
      converter: this.converter,
      translation: this.translation,
      highlightSubstring: this.highlightSubstring,
      collapsableGroups: this.collapsableGroups,
      virtualGroups: this.virtualGroups ? (this.multi ? true : null) : false,
      virtualScroll: this.virtualScroll,
      onLanguageChange: () => this.updateFormatting(true)
    } as ListItemsOperationsContext);
    this.setItems(this.items);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.check();
  }

  public setItems(value: Array<any>) {
    this.internalItems = this.listService.createListItems(value);
    this.updateFormatting();
    this.fixedItemsProvider.setSource(this.internalItems);
    this.consistencyCheck(true);
    this.synchronizeSelected();
    this.resetFilter();
  }

  public consistencyCheck(strict = false) {
    this.internalSelected = (this.internalSelected || []).filter((item: ListItem) => item.belongsTo(this.internalItems, strict));
  }

  public synchronizeSelected() {
    (this.internalItems || []).forEach((item: ListItem) => {
      item.selected = item.belongsTo(this.internalSelected);
    });
    this.updateCustomLayoutIfNeeded();
  }

  public updateCustomLayoutIfNeeded() {
    if (this.multi && this.multipleItemsLayout === MultipleItemsLayout.CUSTOM) {
      this.customMultipleItemsLayoutData = this.customMultipleItemsLayout(this.internalSelected);
    }
  }

  public toggle() {
    if (this.focusManager.isJustFocused(this)) {
      return;  // будет обработано обработчиком фокуса
    }
    if (this.expanded) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  public openDropdown() {
    if (!this.destroyed && !this.disabled && !this.expanded && !this.translating) {
      this.expanded = true;
      this.multipleItemsDetailsShown = false;
      this.highlighted = null;
      this.resetFilter();
      if (this.onTouchedCallback) {
        this.onTouchedCallback();
      }
      this.opened.emit();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.valuesContainer, slave: this.listContainer,
          destroyOnScroll: true, destroyCallback: this.closeDropdown.bind(this)} as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
      if (this.internalSelected.length) {
        this.scrollTo(this.internalSelected[0]);
      }
    }
  }

  public closeDropdown(raisedByOusideClick = false) {
    if (this.expanded) {
      this.expanded = false;
      if (this.containerOverlap) {
        this.positioningManager.detach(this.positioningDescriptor);
        this.positioningDescriptor = null;
      }
      this.closed.emit();
    }
    if (raisedByOusideClick) {
      this.multipleItemsDetailsShown = false;
    }
  }

  public notifyFocusEvent(e: Event) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleBlur() {
    if (this.focusManager.isJustFocused(this.localSearchElement)) {
      return;
    }
    this.focused = false;
    this.closeDropdown();
    this.check();
    this.changeDetector.detectChanges();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (!this.expanded && !this.preventOpening) {
      this.openDropdown();
    }
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    const focusableInputFocused = e && this.focusableInput && e.target === this.focusableInput.nativeElement;
    const localSearchFocused = e && this.localSearch && this.localSearchElement
      && e.target === this.localSearchElement.inputElement.nativeElement;
    if (!e || !(focusableInputFocused || localSearchFocused)) {
      this.preventOpening = true;
      this.focusableInput.nativeElement.focus();
      this.focusManager.notifyFocusMayChanged(this, true);
      this.preventOpening = false;
    }
  }

  public highlight(item: ListItem) {
    if (!item || this.listService.isHighlightable(item)) {
      this.highlighted = item;
    }
  }

  public filterItems(query: string): void {
    this.filteringQuery = query;
    this.setPartialIndex(0);
  }

  public resetFilter() {
    this.filterItems('');
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
    if (this.virtualScroll && this.valuesContainer) {
      const width = this.valuesContainer.nativeElement.clientWidth;
      this.listService.evaluateItemsSizeAsync(this.internalItems, width).subscribe(() => {
        this.updateScrollHeight();
      });
    }
  }

  public updateScrollHeight(preservedScrollPos?: number) {
    if (this.virtualScroll && this.virtualScrollComponent) {
      const items = this.internalDisplayed || this.internalItems || [];
      const totalContentSize = items.reduce((acc, item) => acc + item.getItemHeight(), 0);
      this.virtualScrollComponent.setTotalContentSize(totalContentSize);
    }
  }

  public setPartialIndex(partialNumber: number) {
    if (this.localSearch || this.incrementalLoading) {
      this.fixedItemsProvider.search(this.filteringQuery).subscribe((filteredAll: Array<ListItem>) => {
        const highlightIfNeeded = (filteredItems: Array<ListItem>) => {
          if (this.filteringQuery && this.highlightSubstring) {
            this.listService.highlightSubstring(filteredItems, this.filteringQuery);
          }
        };
        if (this.incrementalLoading) {
          this.partialPageNumber = partialNumber;
          const pageSize = this.incrementalPageSize || ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
          this.fixedItemsProvider.searchPartial(this.filteringQuery, this.partialPageNumber, {partialPageSize: pageSize})
              .subscribe((filteredPaged: Array<ListItem>) => {
            highlightIfNeeded(filteredPaged);
            const partialedItems = partialNumber === 0 ? filteredPaged : this.internalDisplayed.concat(filteredPaged);
            this.partialsLoaded = partialedItems.length === filteredAll.length;
            this.publishList(partialedItems);
          });
        } else {
          highlightIfNeeded(filteredAll);
          this.publishList(filteredAll);
        }
      });
    } else {
      this.publishList(this.internalItems);
    }
  }

  public loadNextPartial() {
    if (this.incrementalLoading && this.expanded && !this.partialsLoaded) {
      this.setPartialIndex(this.partialPageNumber + 1);
    }
  }

  public publishList(items: Array<ListItem>) {
    const alignedItems = this.listService.alignGroupsTreeIfNeeded(items, this.internalItems);
    this.internalDisplayed = alignedItems;
    this.updateScrollHeight();
    this.listed.emit(alignedItems);
    this.changeDetector.detectChanges();
  }

  public getRenderedItems(): Array<ListItem> {
    return this.internalDisplayed || [];
  }

  public multipleSummaryOpenDetails(e: Event) {
    if (!this.destroyed && !this.disabled && this.multi && this.multipleItemsLayout === MultipleItemsLayout.PANEL) {
      this.multipleItemsDetailsShown = !this.multipleItemsDetailsShown;
      if (this.multipleItemsDetailsShown) {
        this.closeDropdown();
      }
      this.returnFocus();
      e.stopPropagation();
    }
  }

  public unselect(item: ListItem, e: Event) {
    if (!this.destroyed && !this.disabled) {
      this.deselectItem(item);
      e.stopPropagation();
    }
  }

  public invertSelection(item: ListItem) {
    this.returnFocus();
    if (item.selected) {
      if (this.multi) {
        this.deselectItem(item);
      }
    } else {
      const successfull = this.selectItem(item);
      if (!this.multi && successfull) {
        this.closeDropdown();
      }
    }
    if (this.virtualGroups) {
      this.listService.adjustVirtualGroupsSelectionIfNeeded(this.internalDisplayed);
    }
  }

  public selectItem(item: ListItem, commitEmit = true) {
    if (!item || item.unselectable || item.lineBreak === LineBreak.SELF) {
      return false;
    }
    if (item.collapsable && this.virtualGroups) {
      if (this.multi) {
        this.listService.getTerminalItems(item, this.internalDisplayed).forEach((listItem: ListItem) => this.selectItem(listItem, false));
        this.commitEmit();
      } else {
        return false;
      }
    } else {
      if (this.multi && this.multipleItemsMaxSelected !== undefined
          && (this.internalSelected || []).length >= this.multipleItemsMaxSelected) {
        return false;
      }
      if (item.belongsTo(this.internalSelected)) {
        return false;
      }
      if (this.multi) {
        this.internalSelected.push(item);
      } else {
        this.internalItems.forEach((previouslySelected: ListItem) => previouslySelected.selected = false);
        this.internalSelected = [item];
      }
      item.selected = true;
      if (commitEmit) {
        this.commitEmit();
      }
    }
    return true;
  }

  public deselectItem(item: ListItem, commitEmit = true) {
    if (item.collapsable && this.virtualGroups) {
      if (this.multi) {
        this.listService.getTerminalItems(item, this.internalDisplayed).forEach((listItem: ListItem) => this.deselectItem(listItem, false));
        this.commitEmit();
      }
    } else {
      item.selected = false;
      if (this.multi) {
        this.internalSelected = (this.internalSelected || []).filter((anyItem: ListItem) => !ListItem.compare(anyItem, item));
      } else {
        this.internalSelected = [];
      }
      if (commitEmit) {
        this.commitEmit();
      }
    }
  }

  public expandCollapse(collapsableItem: ListItem, evt: Event) {
    this.returnFocus();
    this.listService.expandCollapse(collapsableItem, this.internalDisplayed, evt);
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    if (e.key === 'Tab') {  // tab
      // по факту blur, скрываем выпадашку чтобы perfect scrollbar не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // ввод
      if (this.expanded && this.highlighted && !this.highlighted.unselectable) {
        this.invertSelection(this.highlighted);
      } else {
        this.toggle();
      }
    } else if (e.key === ' ') {  // пробел
      if (this.expanded && this.multi && this.highlighted && !this.highlighted.unselectable) {
        this.invertSelection(this.highlighted);
      }
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Escape') { // esc
      this.closeDropdown();
    } else if (this.expanded) { // стрелки
      const navResult = this.listService.handleKeyboardNavigation(e,
        this.internalDisplayed, this.highlighted, this.virtualScrollComponent || this.scrollComponent);
      if (navResult && navResult !== true) {
        this.highlighted = navResult as ListItem;
      }
    }
  }

  public writeValue(value: Array<any> | any) {
    if (this.destroyed) {
      return;
    }
    this.internalSelected = this.listService.createListItems(value, {noIndex: !this.multi});
    this.updateFormatting(false, false);
    this.consistencyCheck();
    this.synchronizeSelected();
    this.resetFilter();
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
    this.updateCustomLayoutIfNeeded();
    this.check();
  }

  private scrollTo(item: ListItem) {
    this.listService.scrollTo(this.virtualScrollComponent || this.scrollComponent, item.findIndexAmong(this.internalDisplayed));
  }

}

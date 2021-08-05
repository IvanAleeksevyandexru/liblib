import {
  Component, ViewChild, Input, Output, OnInit, OnChanges, DoCheck, AfterViewInit,
  EventEmitter, forwardRef, SimpleChanges, ChangeDetectorRef, Optional, Host, SkipSelf, Self
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { from, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { LookupComponent } from  'epgu-lib/lib/components/lookup';
import { ListItem, ListItemConverter, LookupProvider, LookupPartialProvider } from '../../models/dropdown.model';
import { ListItemsService, FixedItemsProvider, ListItemsOperationsContext } from '../../services/list-item/list-items.service';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { Translation, MultipleItemsLayout } from '../../models/common-enums';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { ConstantsService } from '../../services/constants/constants.service';
import { Width } from '../../models/width-height';

@Component({
  selector: 'lib-multi-lookup',
  templateUrl: 'multi-lookup.component.html',
  styleUrls: ['./multi-lookup.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiLookupComponent),
    multi: true
  }, ListItemsService]
})
export class MultiLookupComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, ControlValueAccessor, Validated {

  constructor(
    protected changeDetector: ChangeDetectorRef,
    @Self() protected listService: ListItemsService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public placeholder?: string;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;

  // фукнция форматирования для итема (общая, действует на итем и в поле и в списке)
  @Input() public formatter?: (item: ListItem, context: { [name: string]: any }) => string;
  // функция форматирования специальная, применяется только в списке для случая когда отображение в списке должно отличаться
  @Input() public listFormatter?: (item: ListItem, context: { [name: string]: any }) => string;
  // конвертер объединяет входной и выходной конвертер для объектов не подходящих под интерфейс {id, text}
  @Input() public converter?: ListItemConverter;

  // показ крутилки во время поиска
  @Input() public showSearching = false;
  // крестик очистки при наличии значения
  @Input() public clearable = true;
  // показ выпадашки со значением "не найдено" если результат поиска пустой (вкл), отсутствие выпадашки (выкл)
  @Input() public showNotFound = false;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = false;
  // лейаут области поля для отображения множественных выбранных итемов + кастомный форматтер для специальных кейсов отображения
  @Input() public multipleItemsLayout: MultipleItemsLayout | string = MultipleItemsLayout.WRAP;
  @Input() public customMultipleItemsLayout?: (selected: Array<ListItem>, context?: { [name: string]: any }) => string;
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
  // дополнительная фильтрация результатов поиска с тем чтобы не показывать элементы, которые уже выбраны
  @Input() public uniqueOnly = true;
  // постраничная подгрузка итемов в результатах и размер блока
  @Input() public incrementalLoading = false;
  @Input() public incrementalPageSize = ConstantsService.DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE;
  // включает возможность сворачивать-разворачивать группы элементов, tree-like view
  @Input() public collapsableGroups = false;
  // включает-отключает возможность выбирать группировочные элементы
  @Input() public virtualGroups = true;
  // виртуальный скролл, рендерится в dom лишь отображаемая часть списка (для больших списков)
  @Input() public virtualScroll = false;

  // источник значений в виде фиксированного списка
  @Input() public fixedItems: Array<any> = [];
  // источник значений в виде внешнего провайдера с полностью независимой возможно асинхронной логикой работы
  @Input() public itemsProvider: LookupProvider<any> | LookupPartialProvider<any>;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  // список выбранных значений изменен
  @Output() public changed = new EventEmitter<Array<any> | any>();
  @Output() public opened = new EventEmitter<any>();
  @Output() public closed = new EventEmitter<any>();
  @Output() public listed = new EventEmitter<Array<ListItem>>();

  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control?: AbstractControl;
  public multipleItemsDetailsShown = false;
  public customMultipleItemsLayoutData = null;
  public MultipleItemsLayout = MultipleItemsLayout;

  public internalSelected: Array<ListItem> = [];
  public internalFixedItems: Array<ListItem> = [];
  public lookupItem: any;
  public provider: LookupProvider<any> | LookupPartialProvider<any>;
  @ViewChild('lookup') private lookup: LookupComponent;

  private onTouchedCallback: () => void;
  protected commit(value: Array<any> | any) {}

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'formatter':
        case 'translation':
        case 'converter': {
          this.update();
          break;
        }
        case 'uniqueOnly':
        case 'fixedItems':
        case 'itemsProvider': {
          this.updateProvider();
          break;
        }
      }
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
      listFormatter: this.listFormatter,
      converter: this.converter,
      translation: this.translation,
      onLanguageChange: () => this.updateFormatting(true)
    } as ListItemsOperationsContext);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.updateProvider();
    this.check();
  }

  public updateProvider() {
    this.internalFixedItems = this.listService.createListItems(this.fixedItems);
    const providerProxy = this.itemsProvider || new FixedItemsProvider().setSource(this.internalFixedItems);
    const filterUnique = (promiseOrObservable: Promise<Array<any>> | Observable<Array<any>>) => {
      const observable = promiseOrObservable instanceof Promise ?
        from(promiseOrObservable) : promiseOrObservable as Observable<Array<any>>;
      return observable.pipe(
        map((items: Array<any | ListItem>) => {
          return this.listService.createListItems(items).filter((listItem: ListItem) => !listItem.belongsTo(this.internalSelected));
        }));
    };
    this.provider = {
      search: (query: string, context?: {}) => {
        const results = (providerProxy as LookupProvider).search(query, context);
        return this.uniqueOnly ? filterUnique(results) : results;
      },
      searchPartial: (query: string, page: number, context?: {}) => {
        const results = (providerProxy as LookupPartialProvider).searchPartial(query, page, context);
        return this.uniqueOnly ? filterUnique(results) : results;
      }
    };
    this.consistencyCheck();
    this.updateFormatting(false);
  }

  public consistencyCheck() {
    if (!this.itemsProvider) {
      this.internalSelected = this.internalSelected.filter((item: ListItem) => item.belongsTo(this.internalFixedItems));
    }
  }

  public handleBlur() {
    this.focused = false;
    this.multipleItemsDetailsShown = false;
    this.check();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    if (this.lookup) {
      this.lookup.returnFocus(e);
    }
  }

  public handleOpening() {
    this.multipleItemsDetailsShown = false;
    this.opened.emit();
  }

  public writeValue(value: Array<any> | any) {
    this.internalSelected = this.listService.createListItems(value);
    this.consistencyCheck();
    this.updateFormatting(false);
    this.check();
    this.changeDetector.detectChanges();
  }

  public appendItem(item: any) {
    if (!this.disabled) {
      const listItem = this.listService.createListItem(item, {indexBase: (this.internalSelected || []).length + 1});
      this.internalSelected = [].concat(this.internalSelected).concat(listItem);
      this.updateFormatting(false);
      this.emitValue();
      setTimeout(() => {
        this.lookupItem = null;
        this.changeDetector.detectChanges();
      });
    }
  }

  public removeItem(item: ListItem) {
    if (!this.disabled) {
      this.internalSelected = (this.internalSelected || []).filter((listItem: ListItem) => listItem !== item);
      this.emitValue();
    }
  }

  // единственная возможность удалить итемы для !clearable
  public removeWithBackspaceIfNeeded(e: KeyboardEvent) {
    if ((e.target as any).value === '' && e.key === 'Backspace' && (this.internalSelected || []).length) {
      this.removeItem(this.internalSelected[this.internalSelected.length - 1]);
    }
  }

  public multipleSummaryOpenDetails(e: Event) {
    if (!this.disabled && this.multipleItemsLayout === MultipleItemsLayout.PANEL) {
      this.multipleItemsDetailsShown = !this.multipleItemsDetailsShown;
      if (this.lookup) {
        this.lookup.closeDropdown();
      }
    }
  }

  public emitValue() {
    const outputValue = this.listService.restoreOriginals(this.internalSelected);
    this.commit(outputValue);
    this.changed.emit(outputValue);
  }

  public emitListed(items: Array<ListItem>) {
    this.listed.emit(items);
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

  public updateFormatting(forceTranslate = false) {
    forkJoin([
      this.listService.translateFormat(this.internalFixedItems, forceTranslate),
      this.listService.translateFormat(this.internalSelected, forceTranslate)
    ]).subscribe(() => {
      this.changeDetector.detectChanges();
    });
    if (this.multipleItemsLayout === MultipleItemsLayout.CUSTOM) {
      this.customMultipleItemsLayoutData = this.customMultipleItemsLayout(this.internalSelected);
    }
  }

  public check(): void {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !(this.internalSelected || []).length});
  }

}

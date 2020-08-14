import {
  Component, ViewChild, Input, Output, OnInit, OnChanges, DoCheck, OnDestroy, AfterViewInit,
  EventEmitter, ElementRef, forwardRef, SimpleChanges, ChangeDetectorRef, Optional, Host, SkipSelf
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem, ListItemConverter } from '../../models/dropdown.model';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { FocusManager, Focusable } from '../../services/focus/focus.manager';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { Translation } from '../../models/common-enums';

@Component({
  selector: 'lib-dropdown',
  templateUrl: 'dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }]
})
export class DropdownComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    private focusManager: FocusManager, protected changeDetector: ChangeDetectorRef, private positioningManager: PositioningManager,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string = ValidationShowOn.TOUCHED;
  @Input() public translation: Translation | string = Translation.NONE;

  @Input() public clearable = false;  // кнопка очистки позволяет сбрасывать значение либо удалять выбранные по одному в случае multi
  // должно ли выбранное (список выбранных) значений обрезаться или переноситься на следующую строку (с изменением высоты поля)
  @Input() public nowrap = true;
  @Input() public escapeHtml = false;
  @Input() public containerOverlap = false;

  @Input() public multi = false;  // множественный выбор
  // (checkboxes рядом со значениями в выпадающем списке, массив вместо одиночного итема в качестве входного и выходного значения модели)

  @Input() public localSearch = false; // включает поиск по списку значений выпадающего меню
  @Input() public emptyResultTitle = '&mdash;'; // Отображение состояния, когда ничего не выбрано
  @Input() public pluralizeArray = []; // массив для склонений в режиме мультиселекта

  // функция форматирования для выбранного итема в инпуте и итемов в выпадающем списке
  @Input() public formatter?: (ListItem) => string;
  // конвертер объединяет входной и выходной конвертер из типа не соответствующего {id, text} прямо и обратно
  @Input() public converter?: ListItemConverter;
  @Input() public items: Array<any> = [];

  @Output() protected blur = new EventEmitter<any>();
  @Output() protected focus = new EventEmitter<any>();
  @Output() protected changed = new EventEmitter<Array<any> | any>();

  public expanded: boolean;
  public destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control?: AbstractControl;
  public searchFocus = false;
  public searchValue = '';

  public Translation = Translation;
  public internalItems: Array<ListItem> = [];
  public internalSelected: Array<ListItem> = [];
  public highlighted: ListItem = null;
  public positioningDescriptor: PositioningRequest = null;

  @ViewChild('scrollableArea') private scrollableArea: ElementRef;
  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('focusableInput') private focusableInput: ElementRef;
  @ViewChild('dropdownValues') private valuesField: ElementRef;
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
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'items': {
          this.setItems(this.items);
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

  public ngOnDestroy() {
    this.focusManager.unregister(this);
    this.destroyed = true;
  }

  public update() {
    this.setItems(this.items);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.check();
  }

  public isExists(item: ListItem) {
    return (this.internalItems || []).find((existingItem: ListItem) => item.compare(existingItem));
  }

  public isSelected(item: ListItem, internalSelected?: Array<ListItem>) {
    // internalSelected аргумент добавлен чтобы ангуляр обновлял выход функции по его изменению
    return (this.internalSelected || []).find((selectedItem: ListItem) => item.compare(selectedItem));
  }

  public isHighlighted(item: ListItem) {
    return item.compare(this.highlighted);
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
    if (!this.destroyed && !this.disabled && !this.expanded) {
      this.expanded = true;
      this.highlighted = null;
      if (this.onTouchedCallback) {
        this.onTouchedCallback();
      }
      this.changeDetector.detectChanges();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.valuesContainer, slave: this.listContainer,
          destroyOnScroll: true, destroyCallback: this.closeDropdown.bind(this)} as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
      this.updateScrollBars();
      if (this.internalSelected.length) {
        this.scrollTo(this.internalSelected[0]);
      }
    }
  }

  public closeDropdown(raisedByOutsideClick = false) {
    if (this.expanded) {
      this.expanded = false;
      if (this.containerOverlap) {
        this.positioningManager.detach(this.positioningDescriptor);
        this.positioningDescriptor = null;
      }
    }
    if (raisedByOutsideClick) {
      this.focusManager.notifyFocusMayLost(this);
    }
  }

  public notifyFocusEvent(e: Event) {
    if (!this.localSearch || (this.localSearch && !this.searchFocus)) {
      this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
    }
  }

  public handleBlur() {
    if (!this.localSearch) {
      this.focused = false;
      this.closeDropdown();
      this.check();
      this.blur.emit();
    }
  }

  public handleFocus() {
    if (!this.localSearch || (this.localSearch && !this.searchFocus)) {
    this.focused = this.touched = true;
    if (!this.expanded) {
      this.openDropdown();
    }
    this.check();
    this.focus.emit();
    }
  }

  public returnFocus(e?: Event) {
    if (this.focusableInput && this.focusableInput.nativeElement && (!e || e.target !== this.focusableInput.nativeElement)) {
      if (!this.localSearch || (this.localSearch && !this.searchFocus)) {
        this.focusableInput.nativeElement.focus();
        this.focusManager.notifyFocusMayChanged(this, true);
      }
    }
  }

  public setItems(value: Array<any>) {
    if (value) {
      if (this.converter) {
        this.internalItems = value.map(this.converter.inputConverter);
      } else {
        this.internalItems = value.map((item: any) => new ListItem(item, item));
      }
    } else {
      this.internalItems = [];
    }
    this.internalItems.forEach((item: ListItem) => {
      item.formatted = this.format(item);
    });
    this.internalSelected = !this.localSearch && this.internalSelected && this.internalSelected.length ?
      this.internalSelected.filter(this.isExists.bind(this)) : this.internalSelected;
  }

  public highlight(item: ListItem) {
    this.highlighted = item;
  }

  public format(item: ListItem) {
    return this.formatter ? this.formatter(item) : item.text;
  }

  // allowDeselect аргумент меняет реакцию если данный итем уже является выделенным. что делать: инвертировать выделение или игнорировать
  public selectOrDeselectItem(item: ListItem, allowDeselect?: boolean) {
    let value;
    this.returnFocus(); // предотвращает handleFocus после выбора если календарь был открыт программно без фокусировки на поле
    if (this.multi) {
      value = [].concat(this.internalSelected);  // копия
      if (this.isSelected(item)) {
        if (!allowDeselect) {
          return;
        }
        // исключить из выбранного
        value.splice(value.findIndex((arrayItem) => arrayItem.compare(item)), 1);
      } else {
        // добавить к выбранному
        value.push(item);
      }
      const outputValue = this.converter ?
        value.map(this.converter.outputConverter) : value.map((listItem: ListItem) => listItem.originalItem);
      this.commit(outputValue);
      this.changed.emit(outputValue);
      this.internalSelected = value; // нет необходимости конвертировать/оборачивать, целостность гарантирована
      this.changeDetector.detectChanges();
      this.refreshEllipsis();
    } else {
      if (this.isSelected(item)) {
        if (!allowDeselect) {
          this.closeDropdown();
          return;
        }
        value = null;
      } else {
        value = item;
      }
      const outputValue = this.converter ? this.converter.outputConverter(value) : value && value.originalItem;
      this.commit(outputValue);
      this.changed.emit(outputValue);
      this.internalSelected = value ? [value] : []; // нет необходимости конвертировать/оборачивать, целостность гарантирована
      this.closeDropdown();
    }
    this.check();
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    const highlightedElementIndex = this.internalItems.findIndex((item: ListItem) => item.compare(this.highlighted));
    if (e.key === 'Tab') {  // tab
      // по факту blur, скрываем выпадашку чтобы perfect scrollbar не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // ввод
      if (this.expanded && this.highlighted) {
        this.selectOrDeselectItem(this.highlighted, this.multi);
      } else {
        this.toggle();
      }
    } else if (e.key === 'ArrowUp') {  // вверх
      if (this.expanded) {
        const prevVisible = this.findNextVisible(highlightedElementIndex, false);
        this.highlighted = this.internalItems.length && prevVisible !== null ? this.internalItems[prevVisible] : null;
        this.scrollTo(this.highlighted);
      }
    } else if (e.key === 'ArrowDown') {  // вниз
      if (this.expanded) {
        const nextVisible = this.findNextVisible(highlightedElementIndex, true);
        this.highlighted = this.internalItems.length && nextVisible !== null ? this.internalItems[nextVisible] : null;
        this.scrollTo(this.highlighted);
      }
    } else if (e.key === ' ') {  // пробел
      if (this.expanded && this.multi && this.highlighted) {
        this.selectOrDeselectItem(this.highlighted, true);
      }
    } else if (e.key === 'Escape') { // esc
      this.closeDropdown();
    }
  }

  public writeValue(value: Array<any> | any) {
    if (this.destroyed) {
      return;
    }
    const valueWrapped = value ? Array.isArray(value) ? value : [value] : value;
    if (valueWrapped) {
      if (this.converter) {
        this.internalSelected = valueWrapped.map(this.converter.inputConverter).filter(this.isExists.bind(this));
      } else {
        this.internalSelected = valueWrapped.map((item: any) => new ListItem(item)).filter(this.isExists.bind(this));
      }
    } else {
      this.internalSelected = [];
    }
    this.internalSelected.forEach((item: ListItem) => {
      item.formatted = this.format(item);
    });
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

  public search(e: InputEvent): void {
    if (e.data) {
      const filteredData = this.items.filter(item => item.text.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0);
      this.setItems(filteredData);
    } else {
      this.setItems(this.items);
    }
  }

  public searchFocusHandler(e: any, focus: boolean): void {
    this.searchFocus = focus;
  }

  private findNextVisible(fromIndex: number, directionForward: boolean) {
    const initialIndex = fromIndex === -1 && !directionForward ? 0 : fromIndex;
    let index = initialIndex;
    do {
      index = directionForward ? ++index : --index;
      if (index < 0) {
        index = this.internalItems.length - 1;
      } else if (index >= this.internalItems.length) {
        index = 0;
      }
      if (!this.internalItems[index].hidden) {
        return index;
      }
    } while (index !== initialIndex);
    return null;
  }

  private updateScrollBars() {
    if (this.scrollComponent) {
      this.scrollComponent.directiveRef.update();
    }
  }

  private refreshEllipsis() {
    if (this.valuesField) {
      this.valuesField.nativeElement.style.textOverflow = 'clip';
      setTimeout(() => {
        this.valuesField.nativeElement.style.textOverflow = 'ellipsis';
      });
    }
  }

  private scrollTo(item: ListItem) {
    if (this.scrollContainer()) {
      let itemElement = this.scrollableArea.nativeElement.querySelector('.dropdown-item[itemId="' + item.id + '"]');
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

  private scrollContainer() {
    if (this.scrollableArea && this.scrollableArea.nativeElement) {
      const scrollContainer = this.scrollableArea.nativeElement.parentElement.parentElement;
      return scrollContainer.classList.contains('ps') ? scrollContainer : null;
    }
    return null;
  }

  public trackByFn(index: number, item: ListItem) {
    return item.id;
  }
}

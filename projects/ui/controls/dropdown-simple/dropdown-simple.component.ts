import {
  Component, ViewChild, Input, Output, OnInit, OnChanges, DoCheck, OnDestroy, AfterViewInit,
  EventEmitter, ElementRef, forwardRef, SimpleChanges, ChangeDetectorRef, Optional, Host, SkipSelf
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem, ListElement } from '@epgu/ui/models/dropdown';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { FocusManager, Focusable } from '@epgu/ui/services/focus';
import { Validated } from '@epgu/ui/models/validation-show';
import { ListItemsAccessoryService } from '@epgu/ui/services/list-item';
import { ValidationHelper } from '@epgu/ui/services/validation-helper';
import { Translation, LineBreak, ValidationShowOn } from '@epgu/ui/models/common-enums';
import { Width } from '@epgu/ui/models';

@Component({
  selector: 'lib-dropdown-simple',
  templateUrl: 'dropdown-simple.component.html',
  styleUrls: ['./dropdown-simple.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownSimpleComponent),
    multi: true
  }]
})
export class DropdownSimpleComponent implements OnInit, AfterViewInit, OnChanges,
  DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    private focusManager: FocusManager, protected changeDetector: ChangeDetectorRef,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;

  // крестик очистки при наличии значения: один для !multi или персональный у каждого значения для множественного выбора
  @Input() public clearable = false;
  // экранирование хтмл при выводе
  @Input() public escapeHtml = false;
  // заглушка для отсутствия выбранного значения/значений
  @Input() public placeholder = '&mdash;';
  // перевод значений при выводе (текст значения должен быть приемлемым кодом транслитерации)
  @Input() public translation: Translation | string = Translation.NONE;

  // расширяемое множество вариантов текстуризации, вы можете писать собственные "скины" в стилях
  @Input() public texture: 'standard' | 'some-of-your-custom-texture-name' = 'standard';

  // источник значений, массив элементов
  // допустимо использование только элементов вида ListElement, конвертеры здесь не поддерживаются
  @Input() public items: Array<ListElement> = [];

  @Output() public blur = new EventEmitter<void>();
  @Output() public focus = new EventEmitter<void>();
  // выбранное значение (или набор выбранных значений) изменилось
  @Output() public changed = new EventEmitter<ListElement>();
  @Output() public opened = new EventEmitter<void>();
  @Output() public closed = new EventEmitter<void>();

  public expanded: boolean;
  public destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control?: AbstractControl;
  public LineBreak = LineBreak;
  public Translation = Translation;

  // приведенный к [ListItem] входящий список итемов
  public internalItems: Array<ListItem> = [];
  // активный выбранный итем, синхронизируется с моделью
  public currentItem: ListItem;
  // подсвеченнйы для выбора элемент
  public highlighted: ListItem = null;

  @ViewChild('scrollableArea') private scrollableArea: ElementRef;
  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;
  @ViewChild('focusableInput') private focusableInput: ElementRef;

  private onTouchedCallback: () => void;
  protected commit(value: Array<any> | any) {}

  public ngOnInit() {
    this.setItems(this.items);
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.check();
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
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

  public ngOnDestroy() {
    this.focusManager.unregister(this);
    this.destroyed = true;
  }

  public setItems(value: Array<ListElement>) {
    if (this.clearable && value[0].id !== 'empty-item') {
      value.unshift(new ListItem({id: 'empty-item', text: this.placeholder}));
    }
    this.internalItems = value && Array.isArray(value) ? value.map((item: ListElement) => new ListItem(item, item)) : [];
    this.consistencyCheck();
  }

  public consistencyCheck() {
    if (this.currentItem) {
      this.currentItem = this.currentItem.findSame(this.internalItems);
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
    if (!this.destroyed && !this.disabled && !this.expanded) {
      this.expanded = true;
      this.highlighted = null;
      if (this.onTouchedCallback) {
        this.onTouchedCallback();
      }
      this.opened.emit();
      this.updateScrollBars();
      if (this.currentItem) {
        ListItemsAccessoryService.scrollTo(this.scrollComponent, this.currentItem.findIndexAmong(this.internalItems));
      }
    }
  }

  public closeDropdown(raisedByOusideClick = false) {
    if (this.expanded) {
      this.expanded = false;
      this.closed.emit();
    }
  }

  public notifyFocusEvent(e: Event) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleBlur() {
    this.focused = false;
    this.closeDropdown();
    this.check();
    this.changeDetector.detectChanges();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (!this.expanded) {
      this.openDropdown();
    }
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    if (!e || this.focusableInput && e.target !== this.focusableInput.nativeElement) {
      this.focusableInput.nativeElement.focus();
      this.focusManager.notifyFocusMayChanged(this, true);
    }
  }

  public highlight(item: ListItem) {
    this.highlighted = item;
  }

  public selectItem(item: ListItem) {
    if (item?.id === 'empty-item') {
      this.selectItem(null);
      return;
    }
    this.returnFocus();
    if (item && (item.unselectable || item.lineBreak === LineBreak.SELF || item === this.currentItem)) {
      return false;
    }
    this.currentItem = item;
    const value = item && item.originalItem && !item.hasNoOriginal() ? item.originalItem : item;
    this.commit(value);
    this.changed.emit(value);
    this.closeDropdown();
  }

  public clear(e: Event) {
    if (!this.disabled) {
      this.selectItem(null);
      e.stopPropagation();
    }
  }

  public handleKeydownNavigation(e: KeyboardEvent) {
    const isHighlitable = (item: ListItem) => {
      return !item.hidden && !item.unselectable && item.lineBreak !== LineBreak.SELF;
    };
    if (e.key === 'Tab') {  // tab
      // по факту blur, скрываем выпадашку чтобы perfect scrollbar не получил фокус
      this.closeDropdown();
    } else if (e.key === 'Enter') { // ввод
      if (this.expanded && this.highlighted) {
        this.selectItem(this.highlighted);
      } else {
        this.toggle();
      }
    } else if (e.key === 'Escape') { // esc
      this.closeDropdown();
    } else if (e.key === 'ArrowUp') {  // вверх
      e.preventDefault();
      e.stopPropagation();
      const prev = ListItemsAccessoryService.findNextItem(this.internalItems, this.highlighted, false, isHighlitable);
      if (prev !== null) {
        this.highlight(this.internalItems[prev]);
        ListItemsAccessoryService.scrollTo(this.scrollableArea, prev);
      }
    } else if (e.key === 'ArrowDown') {  // вниз
      e.preventDefault();
      e.stopPropagation();
      const next = ListItemsAccessoryService.findNextItem(this.internalItems, this.highlighted, true, isHighlitable);
      if (next !== null) {
        this.highlight(this.internalItems[next]);
        ListItemsAccessoryService.scrollTo(this.scrollableArea, next);
      }
    }
  }

  public writeValue(value: ListElement) {
    if (this.destroyed) {
      return;
    }
    this.currentItem = new ListItem(value, value);
    this.consistencyCheck();
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
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !!this.currentItem});
  }

  private updateScrollBars() {
    if (this.scrollComponent) {
      this.scrollComponent.directiveRef.update();
    }
  }

}

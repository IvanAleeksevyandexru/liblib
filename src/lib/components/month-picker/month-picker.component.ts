import {
  Component, ViewChild, Input, Output, ElementRef, EventEmitter, SimpleChanges, forwardRef,
  OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, Optional, Host, SkipSelf, ChangeDetectorRef
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { Focusable, FocusManager } from '../../services/focus/focus.manager';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { DragDropBinding, DragDropType, DragDropDirection, DragDropOffsetType, DragState } from '../../models/drag-drop.model';
import { DragDropManager } from '../../services/drag-drop/drag-drop.manager';
import { animate, AnimationBuilder, style } from '@angular/animations';
import { Width } from '../../models/width-height';
import { Align } from '../../models/common-enums';
import { MONTHS_CODES, MonthYear } from '../../models/date-time.model';
import * as moment_ from 'moment';

const moment = moment_;

class Common {
  public number: number;
  public disabled = false;
  public selected = false;
}
class Year extends Common {}
class Month extends Common {
  public text: string;
}

const ITEM_WIDTH = 70;
const ITEM_SPACE = 4;
const DELAY = 300;

@Component({
  selector: 'lib-month-picker',
  templateUrl: 'month-picker.component.html',
  styleUrls: ['./month-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthPickerComponent),
    multi: true
  }]
})
export class MonthPickerComponent
    implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    protected focusManager: FocusManager,
    protected dragDropManager: DragDropManager,
    protected changeDetection: ChangeDetectorRef,
    protected animationBuilder: AnimationBuilder,
    @Optional() @Host() @SkipSelf() protected controlContainer: ControlContainer) {}

  @Input() public formControl?: FormControl;
  @Input() public formControlName?: string;
  @Input() public contextClass?: string;  // класс разметки для deep стилей
  @Input() public tabIndex?: string | number;
  @Input() public placeholder?: string;
  @Input() public disabled?: boolean;
  @Input() public clearable = false;
  @Input() public width?: Width | string;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public hideTillNowAvailable?: boolean;

  @Input() public align: Align | string = Align.RIGHT; // выравнивание панели если панель не равна по ширине инпуту
  @Input() public minMonth: MonthYear = MonthYear.fromDate(moment().startOf('year').toDate());
  @Input() public maxMonth: MonthYear = MonthYear.fromDate(moment().endOf('year').toDate());

  @Output() public cleared = new EventEmitter<void>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();
  @Output() public changed = new EventEmitter<any>();

  public dateMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
  public focused = false;
  public touched = false;
  public expanded = false;
  public selectedYear: number;
  public selectedYearChanged = false;
  public invalidDisplayed = false;
  public activeMonthYear: MonthYear;
  public prevYearAvailable = true;
  public nextYearAvailable = true;
  public tillNowAvailable = false;
  public tillNowSelected = false;
  public control: AbstractControl;
  public years: Array<Year> = [];
  public yearsFeedOffset = 0;
  public monthes: Array<Month> =
    MONTHS_CODES.map((monthCode, i) => ({text: 'MONTHS_SHORT.' + monthCode, number: i, disabled: false, selected: false} as Month));
  public minimum: MonthYear;
  public maximum: MonthYear;
  public dragDropDescriptor: DragDropBinding = null;
  public Align = Align;
  public selectDate: string;

  @ViewChild('focusableInput') protected inputElement: ElementRef<HTMLInputElement>;
  @ViewChild('yearsFeed') protected yearsFeed: ElementRef;
  @ViewChild('yearsContainer') protected yearsContainer: ElementRef;

  private onTouchedCallback: () => void;
  protected commit(value: string) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
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
  }

  public writeValue(value: MonthYear | Date | null) {
    if (value && value instanceof MonthYear) {
      const monthNum = value.month + 1;
      const month = monthNum < 10 ? ('0' + monthNum) : monthNum;

      this.activeMonthYear = value;
      this.selectDate = month + '.' + value.year;

    } else if (value && value instanceof Date) {
      this.activeMonthYear = MonthYear.fromDate(value);
      this.selectDate = (value.getMonth() + 1) + '.' + value.getFullYear();

    } else {
      this.activeMonthYear = null;
      this.selectDate = '';
      this.monthes.forEach(item => item.selected = false);
    }
    this.check();
    this.changeDetection.detectChanges();
  }

  public changeDate(str): void {
    if (str) {
      const dateArr = str.split('.');
      let month = parseInt(dateArr[0], 10) - 1;
      let year = parseInt(dateArr[1], 10);

      if (typeof month === 'number' && month >= 0 && month < 12 && year && year.toString().length === 4) {
        const {month: m, year: y} = this.processFullDate(month, year);
        month = m;
        year = y;
      } else if (this.formControl) {
        this.formControl.setErrors({incorrectDate: true});
      }

      if (typeof month === 'number' && month >= 0 && month < 12) {
        this.monthes.forEach((item: Month) => {
          item.selected = item.number === month && !item.disabled;
        });
      }

      if (year && year.toString().length === 4) {
        this.years.forEach((item: Year) => {
          item.selected = item.number === year && !item.disabled;
        });
      }
    } else {
      this.writeValue(null);
      if (this.formControl) {
        this.formControl.setValue(null);
      }
    }
  }

  private processFullDate(month: number, year: number): MonthYear {
    const {year: minYear, month: minMonth} = this.minimum;
    const {year: maxYear, month: maxMonth} = this.maximum;
    const my = new MonthYear(month, year);
    if (my.year > maxYear) {
      my.year = maxYear;
    }
    if (my.year === maxYear && my.month > maxMonth) {
      my.month = maxMonth;
    }
    if (my.year < minYear) {
      my.year = minYear;
    }
    if (my.year === minYear && my.month < minMonth) {
      my.month = minMonth;
    }
    const selected = this.years.find(item => item.number === my.year);
    this.selectYear(selected, false);

    this.writeValue(my);
    if (this.formControl) {
      this.formControl.setValue(my);
      this.formControl.setErrors(null);
    }
    return my;
  }

  public clearValue(e: Event) {
    if (!this.disabled) {
      this.writeValue(null);
      this.commit(null);
      this.cleared.emit();
      this.returnFocus();
    }
    e.stopPropagation();
  }

  public notifyFocusEvent(e: Event) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public returnFocus() {
    if (this.inputElement && this.inputElement.nativeElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (!this.expanded) {
      this.openDropdown();
    }
    this.check();
    this.focus.emit();
  }

  public handleBlur() {
    this.focused = false;
    setTimeout(() => {
      if (this.focused) {
        return;
      }
      this.closeDropdown();
    }, 100);
    this.check();
    this.changeDetection.detectChanges();
    this.blur.emit();
  }

  public toggle(e: Event) {
    this.returnFocus();
    e.stopPropagation();
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
    if (!this.expanded && !this.disabled) {
      this.expanded = true;
      this.rebuildMinMax();
      this.rebuildYears();
      this.rebuildTillNow();
      this.changeDetection.detectChanges();
      this.attachDragDrop();
    }
  }

  public closeDropdown() {
    this.detachDragDrop();
    this.expanded = this.selectedYearChanged = false;
    this.changeDetection.detectChanges();
  }

  public commitAndClose(value: MonthYear) {
    const monthNum = value.month + 1;
    const month = monthNum < 10 ? ('0' + monthNum) : monthNum;
    this.activeMonthYear = value;
    this.selectedYearChanged = false;
    this.changeDetection.detectChanges();
    this.changed.emit(this.activeMonthYear);
    if (this.formControl) {
      this.formControl.setValue(this.activeMonthYear);
    }
    this.selectDate = month + '.' + this.activeMonthYear.year;
    setTimeout(() => this.closeDropdown(), DELAY);
  }

  public rebuildMinMax() {
    this.minimum = this.minMonth || MonthYear.fromDate(new Date());
    this.maximum = this.maxMonth || MonthYear.fromDate(new Date());
    if (this.maximum.firstDay() < this.minimum.firstDay()) {
      this.maximum = this.minimum.next();
    }
  }

  public rebuildYears() {
    const minYear = this.minimum.year - 1;
    const maxYear = this.maximum.year + 1;
    this.years = [];
    for (let year = minYear; year <= maxYear; year++) {
      const disabled = year < this.minimum.year || year > this.maximum.year;
      this.years.push({number: year, disabled, selected: false} as Year);
    }
    let selected = this.years.find((year) =>
      this.activeMonthYear ? this.activeMonthYear.year === year.number : year.number === moment().year()
    );
    if (!selected) {
      const available = this.years.filter((year) => !year.disabled);
      selected = available[available.length - 1];
    }
    this.selectYear(selected);
    this.selectedYearChanged = false;
  }

  public selectYear(year: Year, passive = false) {
    if (year && !year.disabled) {
      this.years.forEach((yearIterated) => yearIterated.selected = false);
      this.selectedYearChanged = true;
      this.rebuildMonths(year.number);
      const complete = (newOffset) => {
        year.selected = true;
        this.selectedYear = year.number;
        this.prevYearAvailable = year.number - 1 >= this.minimum.year;
        this.nextYearAvailable = year.number + 1 <= this.maximum.year;
        if (newOffset) {
          this.yearsFeedOffset = newOffset;
        }
        this.changeDetection.detectChanges();
      };
      if (passive) {
        complete(null);
      } else {
        this.slideTo(year, complete);
      }
    }
  }

  public selectPrevYear() {
    if (this.prevYearAvailable) {
      const prevYear = this.years.find((year) => year.number === this.selectedYear - 1);
      this.selectYear(prevYear);
    }
  }

  public selectNextYear() {
    if (this.nextYearAvailable) {
      const nextYear = this.years.find((year) => year.number === this.selectedYear + 1);
      this.selectYear(nextYear);
    }
  }

  public rebuildMonths(aheadSelectedYear: number) {
    const selectedYear = aheadSelectedYear || this.selectedYear;
    this.monthes.forEach((month: Month) => {
      const monthYear = new MonthYear(month.number, selectedYear);
      month.disabled = monthYear.firstDay() < this.minimum.firstDay() || monthYear.lastDay() > this.maximum.lastDay();
      month.selected = this.activeMonthYear ? monthYear.month === this.activeMonthYear.month : false;
    });
    this.changeDetection.detectChanges();
  }

  public selectMonth(month: Month) {
    if (!month.disabled) {
      this.commitAndClose(new MonthYear(month.number, this.selectedYear));
    }
  }

  public rebuildTillNow() {
    const current = MonthYear.fromDate(new Date());
    this.tillNowAvailable = current.firstDay() >= this.minimum.firstDay() && current.lastDay() <= this.maximum.lastDay();
    this.tillNowSelected = MonthYear.equals(current, this.activeMonthYear);
  }

  public selectTillNow() {
    if (this.tillNowSelected) {
      this.tillNowSelected = false;
    } else {
      this.tillNowSelected = true;
      this.commitAndClose(MonthYear.fromDate(new Date()));
    }
  }

  public attachDragDrop() {
    const selectYearIfNeeded = (currentlyCentered: number) => {
      const selectedIndex = this.years.findIndex((year) => year.selected);
      if (selectedIndex !== currentlyCentered) {
        this.selectYear(this.years[currentlyCentered], true);
      }
    };
    this.dragDropDescriptor = {
      feedElement: this.yearsFeed,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.POSITION,
      centeringNeeded: true, itemDimension: ITEM_WIDTH, itemsDistance: ITEM_SPACE, limit: true,
      dragProgress: (dragState) => {
        selectYearIfNeeded(dragState.selected);
      },
      dragEnd: (dragState: DragState) => {
        selectYearIfNeeded(dragState.selected);
        this.yearsFeedOffset = dragState.offset;
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropDescriptor);
  }

  public detachDragDrop() {
    if (this.dragDropDescriptor) {
      this.dragDropManager.detach(this.dragDropDescriptor);
      this.dragDropDescriptor = null;
    }
  }

  public slideTo(targetYear: Year, callback?: (offset) => void) {
    this.changeDetection.detectChanges();
    const yearIndex = this.years.findIndex((year) => year === targetYear);
    if (yearIndex >= 0 && this.yearsFeed && this.yearsContainer) {
      const feedWidth = this.yearsFeed.nativeElement.scrollWidth;
      const containerWidth = this.yearsContainer.nativeElement.clientWidth;
      const frameWidth = (containerWidth - ITEM_WIDTH) / 2;
      const minLimit = containerWidth - feedWidth;
      let newOffset = -(yearIndex * (ITEM_WIDTH + ITEM_SPACE) - frameWidth);
      newOffset = Math.min(0, Math.max(minLimit, newOffset));
      const done = callback ? callback : (offset) => {};
      if (this.yearsFeedOffset === 0) {
        this.yearsFeedOffset = newOffset;
      }
      const animationPlayer = this.animationBuilder.build([
        style({left: this.yearsFeedOffset + 'px'}), animate(DELAY, style({left: newOffset + 'px'}))
      ]).create(this.yearsFeed.nativeElement);
      animationPlayer.onDone(() => {
        animationPlayer.destroy();
        done(newOffset);
      });
      animationPlayer.play();
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
    this.check();
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {required: !!this.selectDate || this.selectDate?.indexOf('_') > -1});
  }
}

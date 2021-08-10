import {
  Component, ViewChild, Input, Output, EventEmitter, forwardRef,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { ControlValueAccessor, ValidationErrors, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { FocusManager, FocusState } from '../../services/focus/focus.manager';
import { ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { PipedMessage } from '../../models/piped-message';
import { RelativeDate, Range, MonthYear, DateProperties, DatePropertiesPublisher } from '../../models/date-time.model';
import { BrokenDateFixStrategy } from '../../models/common-enums';
import { Subscription, Observer } from 'rxjs';
import { HelperService } from '../../services/helper/helper.service';
import { DatesHelperService } from '../../services/dates-helper/dates-helper.service';
import { ConstantsService } from '../../services/constants/constants.service';
import * as moment_ from 'moment';
const moment = moment_;

const MODEL_FORMAT = ConstantsService.CALENDAR_TEXT_MODEL_FORMAT;

@Component({
  selector: 'lib-range-field',
  templateUrl: 'range-field.component.html',
  styleUrls: ['./range-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RangeFieldComponent),
    multi: true
  }]
})
export class RangeFieldComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {

  constructor(private focusManager: FocusManager, private changeDetection: ChangeDetectorRef) {}

  // name + 'From' и name + 'To' будут применены и использованы
  @Input() public name?: string;
  @Input() public contextClass?: string;  // класс-маркер разметки для deep стилей
  @Input() public disabled?: boolean;
  @Input() public placeholderFrom?: string;  // пара плейсхолдеров для двух полей соответственно
  @Input() public placeholderTo?: string;
  @Input() public tabIndex?: number;

  @Input() public invalidFrom = false;
  @Input() public invalidTo = false;
  @Input() public validationFrom: boolean | string | ValidationErrors = null;
  @Input() public validationTo: boolean | string | ValidationErrors = null; // пара независимых валидаций
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public validationMessages?: string | PipedMessage | ValidationMessages;
  @Input() public containerOverlap = false;
  // question tip для отдельных полей не предусмотрен, подразумевается что он если и будет, то не на полях по отдельности

  // эти свойства транслируются вниз date-picker-ам в неизменном виде
  @Input() public showPanel = false; // Сделала, чтобы всегда открывались отдельные календарики,
                                     // так как два календаря на одной панели не предусмотрены дизайном
  @Input() public textEditable = true; // разрешен ли ввод с клавиатуры
  @Input() public clearable = false;  // можно ли сбрасывать/удалять дату
  @Input() public textModelValue = false;  // является ли модель текстом или датой
  // способ исправления не валидной даты: сбрасывать на пусто, восстанавливать пред значение или не трогать
  @Input() public brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
  @Input() public shortYearFormat = false;
  @Input() public americanFormat = false; // впереди месяц, разделитель / вместо .

  @Input() public minDate: Date | RelativeDate | string = new RelativeDate('start of year');
  @Input() public maxDate: Date | RelativeDate | string = new RelativeDate('end of year');
  @Input() public setEmptyEndDate = false;

  // focus и blur не выбрасываются когда фокус переходит внутри с поля на поле. только при общей утрате/приобретении фокуса
  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();
  @Output() public changed = new EventEmitter<Range<string | Date>>();

  public range: Range<Date | string>;
  public fromText: string | Date;
  public toText: string | Date;
  public expanded = false;
  public blockMobileKeyboard = false;

  public minFromDate: Date;
  public maxFromDate: Date;
  public minToDate: Date;
  public maxToDate: Date;
  public initialFromMonth: MonthYear;
  public initialToMonth: MonthYear;
  public localFields: Array<StandardMaskedInputComponent>;
  public datePropertiesPublisher = null;

  @ViewChild('fromDate') public fromDate: DatePickerComponent;
  @ViewChild('toDate') public toDate: DatePickerComponent;
  @ViewChild('startDate') public startDate: DatePickerComponent;
  @ViewChild('endDate') public endDate: DatePickerComponent;
  public focusManagerSubscription: Subscription;

  private onTouchedCallback: () => void;
  protected commit(value: Range<Date | string>) {}

  public ngAfterViewInit() {
    this.localFields = [this.fromDate.inputElement, this.toDate.inputElement];
    this.focusManagerSubscription = this.focusManager.subscribe({next: (state: FocusState) => {
      if (this.localFields.includes(state.current) && !this.localFields.includes(state.prev)) {
        this.handleFocus();
      } else if (this.localFields.includes(state.prev) && !this.localFields.includes(state.current)) {
        this.handleBlur();
      }
    }} as Observer<any>);
    this.datePropertiesPublisher = {
      publish: (dateProperties: DateProperties): void => {
        dateProperties.locked = moment(dateProperties.date).isBefore(this.minFromDate, 'day')
          || moment(dateProperties.date).isAfter(this.maxToDate, 'day');
      }
    } as DatePropertiesPublisher;
    this.updateText();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'minDate':
        case 'maxDate': {
          this.updateRangeLimitsByValue();
        }
      }
    }
  }

  public ngOnDestroy() {
    this.focusManagerSubscription.unsubscribe();
  }

  public openPanel() {
    if (!this.expanded && !this.disabled) {
      this.suppressMobileKeyboard();
      this.expanded = true;
      this.changeDetection.detectChanges();
      this.updateRangeLimitsByValue();
      // ожидается рендер, который для asSimplePanel состояния запускается асинхронно
      setTimeout(() => {
        this.synchronizeRangeStart();
      });
      if (this.onTouchedCallback) {
        this.onTouchedCallback();
      }
    }
  }

  public closePanel() {
    if (this.setEmptyEndDate && !this.range && this.startDate && this.startDate.rangeStart) {
      this.range = Range.create(this.startDate.rangeStart, this.maxToDate, this.textModelValue);
      this.synchronizeRangeStart();
      this.rangeUpdated();
    }

    this.expanded = false;
  }

  public toggle(sourceIsFromField: boolean, evt: MouseEvent) {
    if (!this.showPanel) {
      return;
    }
    if (this.focusManager.isJustFocused(this.localFields) && this.expanded) {
      // либо поле было зафокушено извне и это обработано handleFocus, либо это переключение между полями, реакция не требуется
      return;
    }
    if (this.expanded) {
      this.closePanel();
    } else {
      const sourceIsInputField = (evt.target as Element).nodeName.toLowerCase() === 'input';
      if (sourceIsInputField && HelperService.isTouchDevice()) {
        this.cancelSupressingMobileKeyboard();
        setTimeout(() => {
          const sourceInput = sourceIsFromField ? this.fromDate.inputElement : this.toDate.inputElement;
          sourceInput.loseFocus();
          sourceInput.returnFocus();
        });
      } else {
        this.openPanel();
      }
    }
  }

  public suppressMobileKeyboard() {
    if (HelperService.isTouchDevice()) {
      this.blockMobileKeyboard = true;
      this.changeDetection.detectChanges();
    }
  }

  public cancelSupressingMobileKeyboard() {
    this.blockMobileKeyboard = false;
    this.changeDetection.detectChanges();
  }

  public handleFocus() {
    if (!this.expanded && !HelperService.isTouchDevice() && this.showPanel) {
      this.openPanel();
    }
    this.focus.emit();
  }

  public handleBlur() {
    this.closePanel();
    this.blur.emit();
  }

  public returnFocus(evt: Event) {
    if (this.focusManager.isJustFocused(this.localFields)) {
      return;
    }
    if (this.fromText) {
      this.toDate.returnFocus(evt);
    } else {
      this.fromDate.returnFocus(evt);
    }
  }

  public handleChange(sourceIsFromField: boolean, newValueEntered: string | Date) {
    const startDateMissed = !this.range || !this.range.start;
    const endDateMissed = !this.range || !this.range.end;
    if (!newValueEntered) {
      if (sourceIsFromField && endDateMissed || !sourceIsFromField && startDateMissed) {
        this.range = null;
        this.rangeUpdated();
        return;
      }
    }
    if (sourceIsFromField) {
      this.range = Range.create(newValueEntered, (this.range || {} as any).end, this.textModelValue);
    } else {
      this.range = Range.create((this.range || {} as any).start, newValueEntered, this.textModelValue);
    }
    this.synchronizeRangeStart();
    this.rangeUpdated();
  }

  public synchronizeRangeStart(synchronizeToModel = true) {
    // шарим состояние начала выделения диапазона одновременно для обоих календарей друг другу
    if (!this.startDate || !this.endDate) {
      return;
    }
    if (synchronizeToModel) {
      if (!this.range || this.range.isEmpty()) {
        this.startDate.rangeStart = this.endDate.rangeStart = null;
      } else if (this.range && this.range.isHalfed()) {
        const singleDate = this.textModelValue ? moment(this.range.start || this.range.end).toDate() : this.range.start || this.range.end;
        this.startDate.rangeStart = this.endDate.rangeStart = singleDate as Date;
      }
      this.startDate.refresh();
      this.endDate.refresh();
    } else {
      if (this.startDate.rangeStart && !this.endDate.rangeStart) {
        this.endDate.rangeStart = this.startDate.rangeStart;
        this.endDate.refresh();
      } else if (this.endDate.rangeStart && !this.startDate.rangeStart) {
        this.startDate.rangeStart = this.endDate.rangeStart;
        this.startDate.refresh();
      }
    }
  }

  public rangeUpdated(closePanel = false) {
    this.updateText();
    this.commit(this.range);
    this.changed.emit(this.range);
    this.updateRangeLimitsByValue();
    if (closePanel) {
      this.closePanel();
    }
  }

  public updateText() {
    if (this.range) {
      this.fromText = this.range.start;
      this.toText = this.range.end;
    } else {
      this.fromText = this.toText = null;
    }
  }

  public writeValue(value: Range<Date | string>) {
    this.range = value;
    this.updateText();
    this.updateRangeLimitsByValue();
    this.synchronizeRangeStart();
  }

  public navigated(sourceIsFromField: boolean, monthYear: MonthYear) {
    this.updateRangeLimitsByNavigation(sourceIsFromField, monthYear);
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  public updateRangeLimitsByValue() {
    const minDateDefault = moment().startOf('year').startOf('day').toDate();
    const maxDateDefault = moment().endOf('year').startOf('day').toDate();
    let minDate = DatesHelperService.relativeOrFixedToFixed(this.minDate) || minDateDefault;
    let maxDate = DatesHelperService.relativeOrFixedToFixed(this.maxDate) || maxDateDefault;
    if (minDate > maxDate || MonthYear.equals(MonthYear.fromDate(minDate), MonthYear.fromDate(maxDate))) {
      minDate = minDateDefault;
      maxDate = maxDateDefault;
    }
    this.minFromDate = minDate;
    this.maxToDate = maxDate;
    if (this.showPanel) {
      // в режиме showPanel min/max границы определяют возможность навигации (перелистывания) на месяц с датой
      let rangeStartMonth = null;
      let rangeEndMonth = null;
      if (this.range && this.range.start) {
        rangeStartMonth = MonthYear.fromDate(this.convertToDate(this.range.start));
      } else if (this.range && this.range.end) {
        rangeStartMonth = MonthYear.fromDate(this.convertToDate(this.range.end)).prev();
      } else {
        rangeStartMonth = MonthYear.fromDate(new Date());
      }
      if (this.range && this.range.end) {
        rangeEndMonth = MonthYear.fromDate(this.convertToDate(this.range.end));
      } else if (this.range && this.range.start) {
        rangeEndMonth = MonthYear.fromDate(this.convertToDate(this.range.start)).next();
      } else {
        rangeEndMonth = MonthYear.fromDate(new Date());
      }
      if (MonthYear.equals(rangeStartMonth, rangeEndMonth)) {
        rangeEndMonth = rangeEndMonth.next();
        if (rangeEndMonth.firstDay() > maxDate) {
          rangeEndMonth = rangeEndMonth.prev();
          rangeStartMonth = rangeStartMonth.prev();
        }
      }
      this.minToDate = moment(rangeStartMonth.lastDay()).add(1, 'day').toDate();
      this.maxFromDate = moment(rangeEndMonth.firstDay()).add(-1, 'day').toDate();
      this.initialFromMonth = rangeStartMonth;
      this.initialToMonth = rangeEndMonth;
    } else {
      // в режиме !showPanel min/max просто блокирует даты, требования запрета навигации на один и тот же месяц нет
      this.minToDate = this.fromText ? this.convertToDate(this.fromText) : minDate;
      this.maxFromDate = this.toText ? this.convertToDate(this.toText) : maxDate;
    }
  }

  public updateRangeLimitsByNavigation(sourceIsFromField: boolean, monthYear: MonthYear) {
    if (sourceIsFromField) {
      this.minToDate = moment(monthYear.lastDay()).add(1, 'day').toDate();
    } else {
      this.maxFromDate = moment(monthYear.firstDay()).add(-1, 'day').toDate();
    }
  }

  private convertToDate(date: Date | string): Date {
    return this.textModelValue ? moment(date, MODEL_FORMAT).toDate() : date as Date;
  }

}

import { Component, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter, SimpleChanges,
  OnInit, OnChanges, DoCheck, AfterViewInit, OnDestroy, ChangeDetectorRef, forwardRef, Optional, Host, SkipSelf } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, AbstractControl, ControlContainer, NG_VALUE_ACCESSOR } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { PipedMessage } from '../../models/piped-message';
import { HorizontalAlign } from '../../models/positioning';
import { Translation, Align, TipDirection, BrokenDateFixStrategy, MessagePosition, RemoveMaskSymbols } from '../../models/common-enums';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { FocusManager } from '../../services/focus/focus.manager';
import { DatesHelperService } from '../../services/dates-helper/dates-helper.service';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { HelperService } from '../../services/helper/helper.service';
import { ConstantsService } from '../../services/constants.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { DragDropManager } from '../../services/drag-drop/drag-drop.manager';
import { DragDropBinding, DragDropType, DragDropDirection, DragDropOffsetType, DragState } from '../../models/drag-drop.model';
import { RelativeDate, Range, MonthYear, DateProperties, DatePropertiesPublisher } from '../../models/date-time.model';
import { Subscription, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Width } from '../../models/width-height';
import * as moment_ from 'moment';
const moment = moment_;

const STD_DATE_FORMAT = 'DD.MM.YYYY';
const STD_SHORT_FORMAT = 'DD.MM.YY';
const AM_DATE_FORMAT = 'MM/DD/YYYY';
const AM_SHORT_FORMAT = 'MM/DD/YY';
const MODEL_FORMAT = ConstantsService.CALENDAR_TEXT_MODEL_FORMAT;
const DATE_PATTERN = /^\d\d?[\.\/]\d\d?[\.\/]\d\d?\d?\d?$/;
const WEAK_DATE_PATTERN = /^([\d_][\d_]?)[\.\/]([\d_][\d_]?)[\.\/]([\d_][\d_][\d_]?[\d_]?)$/;
const RANGE_BASE_MASK = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/,
  '-', /\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
const DATE_BASE_MASK = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
const DRAGDROP_CENTERING_THRESHOLD = 0.3;

class ParsingResult<T> {
  public result: T = null;
  public inconsistent = false;
  public requiresRevert = false;
  public markInconsistent() {
    this.inconsistent = true;
    return this;
  }
  public revert() {
    this.requiresRevert = true;
    return this;
  }
  public value(value: T) {
    this.result = value;
    return this;
  }
  public empty() {
    this.result = null;
    return this;
  }
}

@Component({
  selector: 'lib-date-picker',
  templateUrl: 'date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true
  }],
  animations: [
    trigger('monthsSlider', [
      state('none', style({ transform: 'translateX(-100%)' })),
      state('prev', style({ transform: 'translateX(0%)' })),
      state('next', style({ transform: 'translateX(-200%)' })),
      transition ('none => prev', [animate ('.3s')]),
      transition ('none => next', [animate ('.3s')]),
      transition ('* => none', [animate ('0s')])
    ])
  ]
})
export class DatePickerComponent implements OnInit, OnChanges, AfterViewInit, DoCheck, ControlValueAccessor, ValidationDetailed, OnDestroy {

  constructor(private changeDetection: ChangeDetectorRef, private focusManager: FocusManager,
              private positioningManager: PositioningManager, private dragDropManager: DragDropManager,
              @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public contextClass?: string;
  @Input() public tabIndex?: string | number;
  @Input() public placeholder?: string;
  @Input() public disabled = false;
  @Input() public width?: Width | string;

  // информационная подсказка
  @Input() public questionTip?: string;
  // позиция вывода информации: типом или отдельным блоком над/под контролом
  @Input() public questionTipPosition: string | MessagePosition = MessagePosition.INSIDE;
  // позиция вывода ошибки: типом или отдельным блоком над/под контролом
  @Input() public validationPosition: string | MessagePosition = MessagePosition.INSIDE;
  // описывает не валидность в терминах true/false, работает только совместно с подсветкой
  @Input() public invalid = false;
  // более полная валидация, пригодная для рендера текста ошибок, отменяет значение invalid если задана
  @Input() public validation: boolean | string | Array<string> | ValidationErrors | { [key: string]: any };
  // когда показывать некорректность поля (как правило начальное пустое поле не считается корректным, но отображать это не нужно)
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  // сообщения валидации вместе с параметрами вывода, работает только совместно с validation
  @Input() public validationMessages: string | PipedMessage | ValidationMessages | { [key: string]: string | PipedMessage} = null;
  // определяет должна ли валидация скрывать информационный тип (показываться вместо) или показываться в дополнение
  @Input() public validationOverride = true;
    // транслитерация и эскейп для валидации
  @Input() public validationTranslation: Translation | string = Translation.APP;
  @Input() public validationEscapeHtml = true;
  // направление бабблов информации-ошибки, для MessagePosition.INSIDE
  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;

  @Input() public textEditable = true; // разрешен ли клавиатурный ввод
  @Input() public clearable = false;  // разрешена ли очистка/сброс значения
  @Input() public containerOverlap = false;
  @Input() public isRange = false;  // выбор периода или отдельной даты
  @Input() public textModelValue = false;  // что является моделью: строка с текстом даты или дата как объект
  // дата считается не валидной если она выходит за допустимые границы или введена с ошибкой (31.02.1994)
  // ввод подобной даты не может быть полностью заблокирован потому что уточняющие месяц и год идут в конце ввода
  // стратегия позволяет определить что делать в этом случае: сбрасывать на ''
  // на пред значение или оставлять как есть чтобы это было обработано снаружи
  @Input() public brokenDateFixStrategy: BrokenDateFixStrategy | string = BrokenDateFixStrategy.RESTORE;
  @Input() public asSimplePanel = false; // без инпута, только панель без возможности ее скрытия/показа
  @Input() public asSimpleInput = false; // только инпут, без возможности показа панели
  @Input() public simplifiedMonthPanel = false;  // без дропдаунов выбора месяца и года, только кнопки вправо-влево
  @Input() public rangeTypeMonthPanel = false; // сдвоенный селектор месяца-года, специальный дизайн для range-field
  @Input() public align: Align | string = Align.RIGHT; // выравнивание панели если панель не равна по ширине инпуту
  @Input() public shortYearFormat = false;
  @Input() public americanFormat = false; // месяц впереди, разделитель / вместо .
  @Input() public readOnly = false;

  // границы допустимого диапазона для ввода/выбора новых дат, могут иметь относительный формат, см HelperService.relativeDateToDate
  @Input() public minDate: Date | RelativeDate | string = new RelativeDate('start of year');
  @Input() public maxDate: Date | RelativeDate | string = new RelativeDate('end of year');
  @Input() public forcedNavigation: MonthYear; // какой месяц открывать изначально если нет значения (вместо текущего)
  @Input() public externalDatePropertiesPublisher: DatePropertiesPublisher = null;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public changed = new EventEmitter<any>();
  @Output() public cleared = new EventEmitter<void>();
  @Output() public dateSelected = new EventEmitter<Date>();
  @Output() public navigated = new EventEmitter<MonthYear>();
  @Output() public opened = new EventEmitter<any>();
  @Output() public closed = new EventEmitter<any>();

  public weeks: Array<Array<DateProperties>> = [];
  public prevWeeks: Array<Array<DateProperties>> = [];
  public nextWeeks: Array<Array<DateProperties>> = [];
  public daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => 'WEEKDAYS.' + day);
  public rangeMask = RANGE_BASE_MASK;
  public dateMask = DATE_BASE_MASK;
  public dateFormat = STD_DATE_FORMAT;
  public shortDateFormat = STD_SHORT_FORMAT;
  public control: AbstractControl;
  public Align = Align;
  public MessagePosition = MessagePosition;
  public RemoveMaskSymbols = RemoveMaskSymbols;

  public expanded = false;
  public inconsistent = false;
  public invalidDisplayed = false;
  public text = '';
  public monthShift = 'none';
  public blockMobileKeyboard = false;
  public dateEnteringController: (value: any, additionals: any) => string | boolean;
  public forcedToAcceptValue: string;
  public positioningDescriptor: PositioningRequest = null;
  public dragDropDescriptor: DragDropBinding = null;

  public date: Date = null;
  public range: Range<Date> = new Range<Date>(null, null);
  public rangeStart: Date = null;
  public activeMonthYear: MonthYear = null;
  public minimumDate = this.getMinimumDate();
  public maximumDate = this.getMaximumDate();

  @ViewChild('input') public inputElement: StandardMaskedInputComponent;
  @ViewChild('calendarContainer') public calendarContainer: ElementRef;
  @ViewChild('fieldContainer', {static: false}) public fieldContainer: ElementRef;
  @ViewChild('monthsFeed') public monthsFeed: ElementRef;

  private onTouchedCallback: () => void;
  private commit(value: string | Date | Range<string> | Range<Date>) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    this.dateEnteringController = this.createDateEnteringController();
  }

  public ngAfterViewInit() {
    // focusManager подписка не требуется, нижележащий masked-input берет это на себя
    this.update();
    if (this.asSimplePanel) {
      setTimeout(() => {
        this.openCalendar();
        this.changeDetection.markForCheck();
      });
    }
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'isRange':
        case 'shortYearFormat':
        case 'americanFormat': {
          this.updateMaskAndFormats();
          break;
        }
        case 'minDate':
        case 'maxDate': {
          this.updateCalendarLimits();
          break;
        }
        case 'forcedNavigation': {
          this.resetNavigation();
        }
      }
    }
    this.check();
  }

  public ngDoCheck() {
    if (this.inputElement && this.control) {
      this.inputElement.setTouched(this.control.touched);
    }
    this.check();
  }

  public ngOnDestroy() {
    this.detachDescriptors();
  }

  public update() {
    this.updateMaskAndFormats();
    this.updateCalendarLimits();
  }

  public openCalendar() {
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.asSimpleInput) {
      return;
    }
    if (!this.expanded && !this.disabled && !this.readOnly || this.asSimplePanel) {
      this.expanded = true;
      this.rangeStart = null;
      this.suppressMobileKeyboard();
      this.resetNavigation();
      this.renderMonthGrid();
      this.changeDetection.detectChanges();
      this.attachDescriptors();
      this.opened.emit();
    }
  }

  public closeCalendar() {
    this.expanded = false;
    this.detachDescriptors();
    this.closed.emit();
  }

  public toggle(sourceIsInputField: boolean) {
    if (sourceIsInputField && this.focusManager.isJustFocused(this.inputElement) || this.asSimpleInput) {
      return;  // будет обработано handleFocus
    }
    if (this.expanded) {
      this.closeCalendar();
    } else {
      if (sourceIsInputField && HelperService.isTouchDevice()) {
        this.cancelSupressingMobileKeyboard();
        setTimeout(() => {
          this.inputElement.loseFocus();
          this.returnFocus();
        });
      } else {
        this.openCalendar();
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

  public attachDescriptors() {
    this.dragDropDescriptor = {
      feedElement: this.monthsFeed,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.TRANSFORM,
      centeringNeeded: true, cleanUp: true, limit: true, centeringThreshold: DRAGDROP_CENTERING_THRESHOLD,
      dragEnd: (dragState: DragState) => {
        const direction = dragState.animatedForward ? (dragState.dragForward ? 1 : -1) : 0;
        this.handleMonthNavigationAnimationDone(direction);
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropDescriptor);
    if (this.containerOverlap) {
      this.positioningDescriptor = {master: this.fieldContainer, slave: this.calendarContainer,
        destroyOnScroll: true, destroyCallback: this.closeCalendar.bind(this),
        alignX: this.align === Align.LEFT ? HorizontalAlign.LEFT_TO_LEFT :
          this.align === Align.RIGHT ? HorizontalAlign.RIGHT_TO_RIGHT : null,
          width: this.align && this.align === Align.ADJUST ? null : '280px'
        } as PositioningRequest;
      this.positioningManager.attach(this.positioningDescriptor);
    }
  }

  public detachDescriptors() {
    if (this.containerOverlap && this.positioningDescriptor) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
    if (this.dragDropDescriptor) {
      this.dragDropManager.detach(this.dragDropDescriptor);
      this.dragDropDescriptor = null;
    }
  }

  public selectDate(dateItem: DateProperties) {
    this.suppressMobileKeyboard();
    this.returnFocus(); // предотвращает handleFocus после выбора если календарь был открыт программно без фокусировки на поле
    if (dateItem.locked || !dateItem.day) {
      return;
    }
    const date = dateItem.date;
    if (this.isRange) {
      if (this.rangeStart) {
        this.commitSave(Range.create(this.rangeStart, date, this.textModelValue), true);
        this.rangeStart = null;
        this.closeCalendar();
      } else {
        this.rangeStart = date;
      }
    } else {
      this.commitSave(this.textModelValue ? moment(date).format(MODEL_FORMAT) : date, true);
      this.closeCalendar();
    }
    this.updateDateItemProperties(this.weeks);
    this.dateSelected.emit(date);
  }

  public handleChange(value: string) {
    if (!this.textEditable) {
      this.recover();
      return;
    }
    const parsingResult = this.isRange ? this.createRangeFromString(value) : this.createDateFromString(value);
    if (parsingResult.requiresRevert) {
      this.recover();
      return;
    }
    this.inconsistent = parsingResult.inconsistent;
    const shouldFixBrokenValue = this.brokenDateFixStrategy !== BrokenDateFixStrategy.NONE;
    if (!parsingResult.inconsistent || !shouldFixBrokenValue) {
      this.commitSave(parsingResult.result, shouldFixBrokenValue);
    }
    this.check();
  }

  public resetToEmpty() {
    if (!this.disabled) {
      this.commitSave(null, true);
      this.cleared.emit();
    }
    this.closeCalendar();
  }

  /**
   * Notified when model changed
   */
  public writeValue(value: Date | string | Range<Date> | Range<string>) {
    this.inconsistent = false;
    this.updateMaskAndFormats();
    const prevText = this.text;
    const internalState = this.createState(value);
    if (this.isRange) {
      this.range = internalState as Range<Date>;
    } else {
      this.date = internalState as Date;
    }
    if (value) {
      if (this.textModelValue) {
        if (this.isRange) {
          this.text = this.formatTextDate((value as Range<string>).start) + '-' + this.formatTextDate((value as Range<string>).end);
        } else {
          this.text = this.formatTextDate(value as string);
        }
      } else {
        this.recover();
      }
    } else {
      this.text = this.emptyText();
    }
    if (this.text !== prevText) {
      this.forcedToAcceptValue = this.text; // временно блокирует фильтр на маске, допуская значение из модели в поле
    }
    this.rangeStart = null;
    if (this.expanded) {
      this.updateDateItemProperties(this.weeks);
    }
  }

  public createState(value: Date | string | Range<Date> | Range<string>) {
    if (value) {
      if (this.isRange) {
        const startDate = (value as Range<string> | Range<Date>).start;
        const endDate = (value as Range<string> | Range<Date>).end;
        if (this.textModelValue) {
          return new Range<Date>(this.toDate(startDate, MODEL_FORMAT), this.toDate(endDate, MODEL_FORMAT));
        } else {
          return new Range<Date>(startDate as Date, endDate as Date);
        }
      } else {
        if (this.textModelValue) {
          return this.toDate(value as string, MODEL_FORMAT);
        } else {
          return value as Date;
        }
      }
    } else {
      return this.isRange ? new Range<Date>(null, null) : null;
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
  }

  public handleBlur() {
    this.closeCalendar();
    this.blur.emit();
  }

  public handleFocus() {
    if (!this.expanded && !HelperService.isTouchDevice()) {
      this.openCalendar();
    }
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    if (!this.asSimplePanel) {
      this.inputElement.returnFocus(e);
    }
  }

  public stopPropagation(e: Event) {
    e.stopPropagation();
  }

  public navigateTo(monthYear: MonthYear) {
    const prev = this.activeMonthYear;
    this.activeMonthYear = monthYear;
    this.checkAndCorrectNavigation();
    if (!MonthYear.equals(prev, monthYear)) {
      this.renderMonthGrid();
      this.navigated.emit(this.activeMonthYear);
    }
  }

  public navigateToPreviousMonth() {
    if (MonthYear.equals(this.activeMonthYear, MonthYear.fromDate(this.minimumDate))) {
      return;
    }
    this.monthShift = 'prev'; // триггерит анимацию
  }

  public navigateToNextMonth() {
    if (MonthYear.equals(this.activeMonthYear, MonthYear.fromDate(this.maximumDate))) {
      return;
    }
    this.monthShift = 'next'; // триггерит анимацию
  }

  public handleMonthNavigationAnimationDone(direction?: number) {
    if (this.monthShift === 'prev' || direction < 0) {
      this.navigateTo(this.activeMonthYear.prev());
    } else if (this.monthShift === 'next' || direction > 0) {
      this.navigateTo(this.activeMonthYear.next());
    }
    this.changeDetection.detectChanges();
  }

  public isToday(date: Date) {
    return date && moment().isSame(moment(date), 'day');
  }

  public isHoliday(date: Date) {
    return date && [6, 7].includes(moment(date).isoWeekday());
  }

  public isSelected(date: Date, rangeStart?: Date) {
    return date && (moment(date).isSame(this.date, 'day') || moment(date).isSame(rangeStart));
  }

  // текущий рейндж не должен подсвечиваться если уже новый rangeStart выбран
  public isInRange(date: Date, rangeStart?: Date) {
    return date && !rangeStart && (moment(date).isBetween(this.range.start, this.range.end));
  }

  public isRangeStart(date: Date, rangeStart?: Date) {
    return date && !rangeStart && moment(date).isSame(this.range.start, 'day');
  }

  public isRangeEnd(date: Date, rangeStart?: Date) {
    return date && !rangeStart && moment(date).isSame(this.range.end, 'day');
  }

  public isDateLocked(date: Date) {
    return date && (this.minimumDate && moment(date).isBefore(this.minimumDate, 'day'))
      || (this.maximumDate && moment(date).isAfter(this.maximumDate, 'day'));
  }

  public isDateOutOfMonth(date: Date, monthShift: number) {
    return date && moment(date).month() !== this.activeMonthYear.month + monthShift;
  }

  public isInPreviewRange(day: DateProperties, rangeStart: Date, rangeEnd: Date) {
    return moment(day.date).isBetween(rangeStart, rangeEnd) || moment(day.date).isBetween(rangeEnd, rangeStart);
  }

  public isPreviewRangeStart(date: Date) {
    return !!this.rangeStart && moment(date).isBefore(this.rangeStart, 'day');
  }

  public clearPreviewRange() {
    this.weeks.forEach((week: DateProperties[]) => {
      week.forEach((item: DateProperties) => {
        item.inPreviewRange = false;
        item.previewRangeStart = false;
        item.previewRangeEnd = false;
      });
    });
  }

  public enterInCalendar(event, hoverDay) {
    if (!this.rangeStart) {
      return;
    }
    if (hoverDay.locked || !hoverDay.day) {
      this.clearPreviewRange();
    } else {
      hoverDay.previewRangeStart = this.isPreviewRangeStart(hoverDay.date);
      hoverDay.previewRangeEnd = !hoverDay.previewRangeStart;
      this.weeks.forEach((week: DateProperties[]) => {
        week.forEach((item: DateProperties) => {
          item.inPreviewRange = this.isInPreviewRange(item, this.rangeStart, hoverDay.date);
          if (item.date !== hoverDay.date) {
            item.previewRangeStart = false;
            item.previewRangeEnd = false;
          }
          if (item.date === this.rangeStart) {
            item.previewRangeStart = !hoverDay.previewRangeStart;
            item.previewRangeEnd = !hoverDay.previewRangeEnd;
          }
        });
      });
    }
  }

  public leaveCalendar() {
    if (this.rangeStart) {
      this.clearPreviewRange();
    }
  }

  public checkAndCorrectNavigation() {
    if (this.activeMonthYear === null) {
      this.activeMonthYear = MonthYear.fromDate(new Date());
    }
    const minMonthYear = MonthYear.fromDate(this.minimumDate);
    const maxMonthYear = MonthYear.fromDate(this.maximumDate);
    if (this.activeMonthYear.firstDay() < minMonthYear.firstDay()) {
      this.activeMonthYear = minMonthYear;
    } else if (this.activeMonthYear.firstDay() > maxMonthYear.firstDay()) {
      this.activeMonthYear = maxMonthYear;
    }
  }

  public resetNavigation() {
    this.activeMonthYear = null;
    if (this.forcedNavigation) {
      this.activeMonthYear = this.forcedNavigation;
    } else {
      if (this.isRange) {
        if (this.range && this.range.start && !isNaN(this.range.start.getTime())) {
          this.activeMonthYear = MonthYear.fromDate(this.range.start);
        }
      } else {
        if (this.date && !isNaN(this.date.getTime())) {
          this.activeMonthYear = MonthYear.fromDate(this.date);
        }
      }
    }
    this.checkAndCorrectNavigation();
  }

  public refresh() {
    this.renderMonthGrid();
  }

  private getMinimumDate() {
    return DatesHelperService.relativeOrFixedToFixed(this.minDate) || moment().startOf('year').startOf('day').toDate();
  }

  private getMaximumDate() {
    return DatesHelperService.relativeOrFixedToFixed(this.maxDate) || moment().endOf('year').startOf('day').toDate();
  }

  private updateCalendarLimits() {
    this.minimumDate = this.getMinimumDate();
    this.maximumDate = this.getMaximumDate();
    if (this.maximumDate < this.minimumDate) {
      this.maximumDate = this.minimumDate;
    }
    this.checkAndCorrectNavigation();
    this.renderMonthGrid();
  }

  private updateMaskAndFormats() {
    const replaceDotWithSlash = (symbol) => symbol === '.' ? '/' : symbol;
    const truncateDateFullYear = (arr) => arr.slice(0, arr.length - 2);
    const truncateRangeFullYear = (arr) => arr.slice(0, arr.indexOf('-') - 2).concat(arr.slice(arr.indexOf('-'), arr.length - 2));
    this.rangeMask = this.americanFormat ?
      (this.shortYearFormat ? truncateRangeFullYear(RANGE_BASE_MASK.map(replaceDotWithSlash)) : RANGE_BASE_MASK.map(replaceDotWithSlash))
      : (this.shortYearFormat ? truncateRangeFullYear(RANGE_BASE_MASK) : RANGE_BASE_MASK);
    this.dateMask = this.americanFormat ?
      (this.shortYearFormat ? truncateDateFullYear(DATE_BASE_MASK.map(replaceDotWithSlash)) : DATE_BASE_MASK.map(replaceDotWithSlash))
      : (this.shortYearFormat ? truncateDateFullYear(DATE_BASE_MASK) : DATE_BASE_MASK);
    this.dateFormat = this.americanFormat ? AM_DATE_FORMAT : STD_DATE_FORMAT;
    this.shortDateFormat = this.americanFormat ? AM_SHORT_FORMAT : STD_SHORT_FORMAT;
  }

  private createDateEnteringController() {
    const pad = (str: string, len?: number) => str.padEnd(len || 2, '_');
    return (value: string, additionals: any): string | boolean => {
      if (this.forcedToAcceptValue && value === this.forcedToAcceptValue) {
        this.forcedToAcceptValue = null;
        // отключение доп проверок если значение пушится из модели (включая начальное) от значения требуется лишь соответствовать маске
        return value;
      }
      try {
        const separator = this.americanFormat ? '/' : '.';
        const probableDates = this.isRange ?
          value.replace(/_/g, '').split('-') : [value.replace(/_/g, '')];
        const unsafeDates = this.isRange ?
          additionals.rawValue.split('-') : [additionals.rawValue];
        let anyChanged = false;
        if (probableDates.length === unsafeDates.length) {
          for (let i = 0; i < probableDates.length; i++) {
            const partials = probableDates[i].split(separator);
            const unsafePartials = unsafeDates[i].split(separator);
            let isChanged = false;
            if (/\d{3}/.test(unsafePartials[0])) {
              isChanged = true;
              partials[0] = unsafePartials[0].substring(0, 2);
            } else if (/\d{3}/.test(unsafePartials[1])) {
              isChanged = true;
              partials[1] = unsafePartials[1].substring(0, 2);
            } else if (/\d{3}/.test(unsafePartials[2]) && this.shortYearFormat
                || /\d{5}/.test(unsafePartials[2]) && !this.shortYearFormat) {
              isChanged = true;
              partials[2] = unsafePartials[2].substring(0, this.shortYearFormat ? 2 : 4);
            }
            const dayPartial = this.americanFormat ? partials[1] : partials[0];
            const monthPartial = this.americanFormat ? partials[0] : partials[1];
            const yearPartial = partials[2];
            if (partials[0] === '00' || partials[1] === '00' || unsafePartials[0] === '_0_' || unsafePartials[1] === '_0_'
                || parseInt(dayPartial, 10) > 31 || parseInt(monthPartial, 10) > 12) {
              return false;
            } else if (isChanged) {
              anyChanged = true;
              probableDates[i] = this.americanFormat ?
                pad(monthPartial) + separator + pad(dayPartial) + separator + pad(yearPartial, this.shortYearFormat ? 2 : 4)
                : pad(dayPartial) + separator + pad(monthPartial) + separator + pad(yearPartial, this.shortYearFormat ? 2 : 4);
            }
          }
          return anyChanged ? (this.isRange ? probableDates.join('-') : probableDates[0]) : value;
        } else {
          return value;
        }
      } catch (e) {
        // не должно происходить, маска защищает от ввода невалидных символов, parseInt не должен падать
        return value;
      }
      return value;
    };
  }

  public createDateFromString(valueOriginal: string) {
    if (this.isEmptyText(valueOriginal)) {
      return this.createEmptyParsingResult<Date | string>();
    }
    const result = new ParsingResult<Date | string>();
    const value = this.fixMissingYearIfNeeded(valueOriginal);
    if (this.isValidDateText(value, true)) {
      return result.value(this.textModelValue ? value.replace(/_/g, '').replace(/\//g, '.') : this.toDate(value, this.dateFormat));
    } else {
      const datePatterned = this.isValidDateText(value, undefined);  // формат даты как бы корректен, но сама дата не валидна
      const validDateOutOfRanges = this.isValidDateText(value, false);  // нормальная дата, но вне допустимого диапазона
      switch (this.brokenDateFixStrategy || '') {
        case BrokenDateFixStrategy.NONE: {
          if (this.textModelValue) {
            result.value(datePatterned ? value.replace(/_/g, '').replace(/\//g, '.') : value);
          } else {
            result.value(datePatterned ? this.toDate(value, this.dateFormat) : null);
          }
          return result.markInconsistent();
        }
        case BrokenDateFixStrategy.RESET: {
          return result.empty();
        }
        case BrokenDateFixStrategy.RESTORE: {
          if (validDateOutOfRanges) {
            const limitedDate = this.toDate(value, this.dateFormat, true);
            return result.value(this.textModelValue ? moment(limitedDate).format(MODEL_FORMAT) : limitedDate);
          } else {
            return result.revert();
          }
        }
      }
    }
  }

  public createRangeFromString(valueOriginal: string) {
    if (this.isEmptyText(valueOriginal, true)) {
      return this.createEmptyParsingResult<Range<Date> | Range<string>>();
    }
    const result = new ParsingResult<Range<Date> | Range<string>>();
    const dates = valueOriginal.split('-');
    if (dates.length > 2) {
      return result.empty();
    }
    const startDateParseResult = this.createDateFromString(dates[0]);
    const endDateParseResult = this.createDateFromString(dates[1]);
    if (startDateParseResult.requiresRevert || endDateParseResult.requiresRevert) {
      return result.revert();
    }
    if (startDateParseResult.inconsistent || endDateParseResult.inconsistent) {
      result.markInconsistent();
    }
    if (!startDateParseResult.result || !endDateParseResult.result &&
        this.brokenDateFixStrategy === BrokenDateFixStrategy.RESET) {
      return result.empty();
    } else {
      return result.value(Range.create(startDateParseResult.result, endDateParseResult.result, this.textModelValue));
    }
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: this.isModelEmpty(), inconsistent: this.inconsistent});
    if (this.inputElement) {
      this.inputElement.ngDoCheck();
    }
  }

  private renderMonthGrid() {
    this.renderSingleMonthGrid(this.weeks, 0);
    this.renderSingleMonthGrid(this.prevWeeks, -1);
    this.renderSingleMonthGrid(this.nextWeeks, 1);
    this.monthShift = 'none';
  }

  private renderSingleMonthGrid(output: Array<Array<DateProperties>>, monthShift: number): void {
    output.splice(0, output.length); // in-place clear
    const firstDayOfMonth = moment().year(this.activeMonthYear.year).month(this.activeMonthYear.month)
      .add(monthShift, 'month').startOf('month').startOf('day');
    const firstDayOfWeekInMonth = firstDayOfMonth.isoWeekday();
    const daysInMonth = firstDayOfMonth.daysInMonth();
    let week = 0;
    output.push([]);
    if (firstDayOfWeekInMonth > 1) {
      for (let i = 1; i < firstDayOfWeekInMonth; i++) {
        // Заполняем пустые клетки в начале и в конце месяца днями, у которых пустой day (текст который выводится),
        // но есть date, которая отличается от крайних дней месяца на один час,
        // чтобы при проверке вхождения дня в диапазон пустые клетки отмечались свойством inRange и подсвечилась
        const firstDayOfMonthForEmpty = moment(firstDayOfMonth).subtract(1, 'hour').toDate();
        output[0].push({day: null, date: firstDayOfMonthForEmpty});
      }
    }
    for (let i = 0; i < daysInMonth; i++) {
      if (output[week].length && output[week].length % 7 === 0) {
        week++;
        output.push([]);
      }
      const date = moment(firstDayOfMonth).add(i, 'day');
      output[week].push({day: date.date(), date: date.toDate()});
    }
    const lastMonthDate = output[week][output[week].length - 1].date;
    const lastMonthDateForEmpty = moment(lastMonthDate).add(1, 'hour').toDate();
    while (output[week].length < 7) {
      output[week].push({day: null, date: lastMonthDateForEmpty});
    }
    this.updateDateItemProperties(output, monthShift);
  }

  private updateDateItemProperties(output: Array<Array<DateProperties>>, monthShift = 0) {
    output.forEach((week: Array<DateProperties>) => {
      week.forEach((day: DateProperties) => {
        day.today = this.isToday(day.date);
        day.holiday = this.isHoliday(day.date);
        day.selected = this.isSelected(day.date, this.rangeStart);
        day.inRange = this.isInRange(day.date, this.rangeStart);
        day.rangeStart = this.isRangeStart(day.date, this.rangeStart);
        day.rangeEnd = this.isRangeEnd(day.date, this.rangeStart);
        day.locked = this.isDateLocked(day.date);
        day.outer = this.isDateOutOfMonth(day.date, monthShift);
        day.inPreviewRange = false;
        day.previewRangeStart = false;
        day.previewRangeEnd = false;
        // повзоляет вносить коррективы снаружи для любых отрендеренных дней
        if (this.externalDatePropertiesPublisher) {
          this.externalDatePropertiesPublisher.publish(day);
        }
      });
    });
  }

  private createEmptyParsingResult<T>() {
    const parsingResult: ParsingResult<T> = new ParsingResult<T>();
    if (this.clearable) {
      return parsingResult.empty();
    }
    switch (this.brokenDateFixStrategy) {
      case BrokenDateFixStrategy.NONE:
        return this.isModelEmpty() ? parsingResult.empty() : parsingResult.markInconsistent();
      case BrokenDateFixStrategy.RESET:
        return parsingResult.empty();
      case BrokenDateFixStrategy.RESTORE:
        return parsingResult.revert();
    }
    return parsingResult;
  }

  private toDate(value: Date | string, format: string, alignToLimits = false) {
    let result;
    if (value instanceof Date) {
      result = value;
    } else {
      if (value === '') {
        result = null;
      } else {
        result = moment(value, format).startOf('day').toDate();
      }
    }
    if (result && alignToLimits) {
      return DatesHelperService.alignToLimits(result, this.minimumDate, this.maximumDate);
    }
    return result;
  }

  private isEmptyText(value: string, rangeSeparatorCheck = false) {
    return !value || value.replace(/[\._\-\/]/g, '') === '' || rangeSeparatorCheck && !value.includes('-');
  }

  private isValidDate(value: Date, checkLimits = true) {
    return moment(value).isValid() && (checkLimits ? value >= this.minimumDate && value <= this.maximumDate : true);
  }

  // 10.05.19 -> 10.05.2019, 10.05.60 -> 10.05.1960
  private fixMissingYearIfNeeded(value: string) {
    const separator = this.americanFormat ? '/' : '.';
    const check = new RegExp('^\\d\\d?\\' + separator + '\\d\\d?\\' + separator + '(\\d\\d)$');
    if (value && check.test(value.replace(/_/g, ''))) {
      const shortYear = parseInt(check.exec(value.replace(/_/g, ''))[1], 10);
      return value.substring(0, value.lastIndexOf(separator)) + separator +
        (shortYear > 50 ? '19' : '20') + value.substring(value.lastIndexOf(separator) + 1);
    } else {
      return value;
    }
  }

  // softCheck - флаг строгости проверки: undefined минимальная проверка по паттерну,
  // false паттерн + требование валидности даты, true паттерн + валидность + в границах диапазона
  private isValidDateText(value: string, strictnessLevel?: boolean | undefined) {
    if (this.isEmptyText(value)) {
      return true;
    }
    if (!DATE_PATTERN.test(value.replace(/_/g, ''))) {
      return false;
    }
    if (strictnessLevel === undefined) {
      return true;
    } else {
      return this.isValidDate(moment(value.replace(/_/g, ''), this.dateFormat).toDate(), strictnessLevel);
    }
  }

  private format(value: Date, forceFullFormat?: boolean) {
    return value && !isNaN(value.getTime()) ? moment(value).format(this.shortYearFormat && !forceFullFormat ?
      this.shortDateFormat : this.dateFormat) : this.emptyText();
  }

  private emptyText() {
    return this.dateMask.map((symbol) => symbol instanceof RegExp ? '_' : symbol).join('');
  }

  private toFixedLenght(valueOriginal: string, len: number) {
    const value = valueOriginal || '';
    if (value.length > len) {
      return value.substring(value.length - len);
    } else {
      return value.padStart(len, '_');
    }
  }

  private formatTextDate(value: string) {
    if (!value) {
      return this.emptyText();
    }
    const separator = this.americanFormat ? '/' : '.';
    if (WEAK_DATE_PATTERN.test(value)) {
      const groups = WEAK_DATE_PATTERN.exec(value);
      const firstGroup = this.toFixedLenght(groups[1], 2);
      const secondGroup = this.toFixedLenght(groups[2], 2);
      const thirdGroup = this.toFixedLenght(groups[3], this.shortYearFormat ? 2 : 4);
      return firstGroup + separator + secondGroup + separator + thirdGroup;
    } else {
      return value;
    }
  }

  private recover() {
    this.inconsistent = false;
    if (this.isRange) {
      this.text = this.format(this.range.start) + '-' + this.format(this.range.end);
    } else {
      this.text = this.format(this.date);
    }
    if (this.inputElement) {
      this.inputElement.writeValue(this.text);
    } else {
      this.changeDetection.markForCheck();
    }
  }

  private isSameValue(value: Date | string | Range<Date> | Range<string>) {
    if (this.isRange) {
      if (value && !this.range || !value && this.range) {
        return false;
      } else {
        if (value) {
          // нет необходимости проверять на двузначный год, коммитится всегда полный 4значный год
          return moment((value as Range<any>).start, this.dateFormat).isSame(this.range.start, 'day')
            && moment((value as Range<any>).end, this.dateFormat).isSame(this.range.end, 'day');
        } else {
          return value === this.range;
        }
      }
    } else {
      if (value && !this.date || !value && this.date) {
        return false;
      } else {
        if (value) {
          return moment(value as string | Date, this.dateFormat).isSame(this.date, 'day');
        } else {
          return value === this.date;
        }
      }
    }
  }

  private isModelEmpty() {
    if (this.isRange) {
      return !this.range || this.range.start === null && this.range.end === null;
    } else {
      return this.date === null;
    }
  }

  private commitSave(value: Date | string | Range<Date> | Range<string>, doWriteValue: boolean) {
    if (!this.isSameValue(value)) {
      let isCommitSuccessful = true;
      const valueChecked = value instanceof Range && value.isEmpty() ? null : value;
      try {
        this.commit(valueChecked);
      } catch (e) {
        isCommitSuccessful = false;
      }
      if (isCommitSuccessful) {
        this.changed.emit(valueChecked);
        if (doWriteValue) {
          // установи внутреннее состояние и обнови инпут
          this.writeValue(valueChecked);
        } else {
          // только обнови внутреннее состояние
          const internalState = this.createState(value);
          if (this.isRange) {
            this.range = internalState as Range<Date>;
          } else {
            this.date = internalState as Date;
          }
        }
      }
    } else if (doWriteValue) {
      this.recover();
    }
  }
}

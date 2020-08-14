import { Component, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter, Renderer2, SimpleChanges,
  OnInit, OnChanges, DoCheck, AfterViewInit, ChangeDetectorRef, forwardRef, Optional, Host, SkipSelf } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, AbstractControl, ControlContainer, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AnimationBuilder, trigger, state, transition, style, animate } from '@angular/animations';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { SimpleSelectComponent } from '../simple-select/simple-select.component';
import { PipedMessage } from '../../models/piped-message';
import { HorizontalAlign } from '../../models/positioning';
import { Translation, Align, TipDirection, BrokenDateFixStrategy } from '../../models/common-enums';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { FocusManager } from '../../services/focus/focus.manager';
import { DatesHelperService } from '../../services/dates-helper/dates-helper.service';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { HelperService } from '../../services/helper/helper.service';
import { ConstantsService } from '../../services/constants.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';
import { RelativeDate, Range, MonthYear, DateProperties, DatePropertiesPublisher } from '../../models/date-time.model';
import { ListItem } from '../../models/dropdown.model';
import { Subscription, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment_ from 'moment';
const moment = moment_;

const STD_DATE_FORMAT = 'DD.MM.YYYY';
const STD_SHORT_FORMAT = 'DD.MM.YY';
const AM_DATE_FORMAT = 'MM/DD/YYYY';
const AM_SHORT_FORMAT = 'MM/DD/YY';
const MODEL_FORMAT = ConstantsService.CALENDAR_TEXT_MODEL_FORMAT;
const DATE_PATTERN = /^\d\d?[\.\/]\d\d?[\.\/]\d\d\d?\d?$/;
const WEAK_DATE_PATTERN = /^([\d_][\d_]?)[\.\/]([\d_][\d_]?)[\.\/]([\d_][\d_][\d_]?[\d_]?)$/;
const RANGE_BASE_MASK = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/,
  '-', /\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
const DATE_BASE_MASK = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];

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
export class DatePickerComponent implements OnInit, OnChanges, AfterViewInit, DoCheck, ControlValueAccessor, ValidationDetailed {

  constructor(private changeDetection: ChangeDetectorRef, private focusManager: FocusManager,
              private renderer: Renderer2, private animationBuilder: AnimationBuilder, private positioningManager: PositioningManager,
              @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public contextClass?: string;
  @Input() public tabIndex?: string | number;
  @Input() public placeholder?: string;
  @Input() public disabled = false;

  @Input() public invalid = false;
  @Input() public validation: boolean | string | ValidationErrors = null;
  @Input() public validationShowOn: ValidationShowOn | string = ValidationShowOn.TOUCHED;
  @Input() public validationMessages: string | PipedMessage | ValidationMessages = null;
  @Input() public questionTip?: string;
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
  @Input() public align: Align | string = Align.RIGHT; // выравнивание панели если панель не равна по ширине инпуту
  @Input() public shortYearFormat = false;
  @Input() public americanFormat = false; // месяц впереди, разделитель / вместо .

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

  public monthsCodes = [];
  public monthsList: Array<ListItem> =
    ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    .map((monthName) => 'MONTHS.' + monthName)
    .map((monthName, index) => ({id: index, text: monthName}))
    .map((monthData: any) => new ListItem(monthData));
  public months: Array<ListItem> = [];
  public years: Array<ListItem> = [];
  public Translation = Translation;
  public Align = Align;

  public weeks: Array<Array<DateProperties>> = [];
  public prevWeeks: Array<Array<DateProperties>> = [];
  public nextWeeks: Array<Array<DateProperties>> = [];
  public daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => 'WEEKDAYS.' + day);
  public rangeMask = RANGE_BASE_MASK;
  public dateMask = DATE_BASE_MASK;
  public dateFormat = STD_DATE_FORMAT;
  public shortDateFormat = STD_SHORT_FORMAT;
  public control: AbstractControl;

  public expanded = false;
  public inconsistent = false;
  public text = '';
  public monthShift = 'none';
  public monthPanelDragOffset = null;
  public monthPanelDragStartPosition = null;
  public monthPanelDragOffsetRelative = 0;
  public monthPanelDragTouchMoveSubscription: Subscription = null;
  public monthPanelDragTouchEndSubscription: Subscription = null;
  public blockMobileKeyboard = false;
  public dateEnteringController: (value: any, additionals: any) => string | boolean;
  public forcedToAcceptValue: string;
  public positioningDescriptor: PositioningRequest = null;

  public date: Date = null;
  public range: Range<Date> = new Range<Date>(null, null);
  public rangeStart: Date = null;

  public activeMonthYear: MonthYear = null;
  public activeMonth: ListItem;
  public activeYear: ListItem;
  public prevMonthAvailable = true;
  public nextMonthAvailable = true;

  public minimumDate = this.getMinimumDate();
  public maximumDate = this.getMaximumDate();

  @ViewChild('input') public inputElement: StandardMaskedInputComponent;
  @ViewChild('calendarContainer') public calendarContainer: ElementRef;
  @ViewChild('fieldContainer', {static: false}) public fieldContainer: ElementRef;
  @ViewChild('monthsFeed') public monthsFeed: ElementRef;
  @ViewChild('monthSelector') public monthSelector: SimpleSelectComponent;
  @ViewChild('yearsSelector') public yearsSelector: SimpleSelectComponent;

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
  }

  public ngDoCheck() {
    if (this.inputElement) {
      if (this.control) {
        this.inputElement.setTouched(this.control.touched);
      }
      this.inputElement.ngDoCheck();
    }
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
    if (!this.expanded && !this.disabled || this.asSimplePanel) {
      this.expanded = true;
      this.rangeStart = null;
      this.suppressMobileKeyboard();
      this.hideMonthYearDropdowns(null);
      this.resetNavigation();
      this.renderMonthGrid();
      this.changeDetection.detectChanges();
      if (this.containerOverlap) {
        this.positioningDescriptor = {master: this.fieldContainer, slave: this.calendarContainer,
          destroyOnScroll: true, destroyCallback: this.closeCalendar.bind(this),
          alignX: this.align && this.align.toUpperCase() === Align.LEFT ? HorizontalAlign.LEFT_TO_LEFT :
            this.align && this.align.toUpperCase() === Align.RIGHT ? HorizontalAlign.RIGHT_TO_RIGHT : null,
            width: this.align && this.align.toUpperCase() === Align.ADJUST ? null : '280px'
          } as PositioningRequest;
        this.positioningManager.attach(this.positioningDescriptor);
      }
    }
  }

  public closeCalendar() {
    this.expanded = false;
    if (this.containerOverlap) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
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

  public selectDate(dateItem: DateProperties) {
    this.suppressMobileKeyboard();
    this.returnFocus(); // предотвращает handleFocus после выбора если календарь был открыт программно без фокусировки на поле
    if (dateItem.locked) {
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

  public handleBlur(raisedByOutsideClick = false) {
    this.closeCalendar();
    if (raisedByOutsideClick) {
      this.focusManager.notifyFocusMayLost(this.inputElement);
    } else {
      this.blur.emit();
    }
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

  public navigateToMonth(month: number) {
    this.navigateTo(new MonthYear(month, this.activeMonthYear.year));
  }

  public navigateToYear(year: number) {
    this.navigateTo(new MonthYear(this.activeMonthYear.month, year));
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

  // привязано к touchstart панели
  public startMonthDragging(e: TouchEvent | any) {
    this.monthPanelDragStartPosition = e.touches[0].clientX;
    const monthPanelWidth = this.calendarContainer.nativeElement.clientWidth;
    this.monthPanelDragOffset = -monthPanelWidth;
    this.monthPanelDragOffsetRelative = 0;
    const monthPanelDragTouchEnd = fromEvent(document, 'touchend');
    this.monthPanelDragTouchMoveSubscription = fromEvent(document, 'touchmove')
      .pipe(takeUntil(monthPanelDragTouchEnd)).subscribe((evt) => this.dragMonthInProcess(evt));
    this.monthPanelDragTouchEndSubscription = monthPanelDragTouchEnd.subscribe((evt) => this.finishMonthDragging());
    this.renderer.setStyle(this.monthsFeed.nativeElement, 'transform', 'translateX(' + this.monthPanelDragOffset + 'px)');
  }

  public dragMonthInProcess(e: TouchEvent | any) {
    const monthPanelWidth = this.calendarContainer.nativeElement.clientWidth;
    let monthPanelOffset = e.touches[0].clientX - this.monthPanelDragStartPosition;
    const maxReached = MonthYear.equals(this.activeMonthYear, MonthYear.fromDate(this.maximumDate));
    const minReached = MonthYear.equals(this.activeMonthYear, MonthYear.fromDate(this.minimumDate));
    if (maxReached && monthPanelOffset < 0 || minReached && monthPanelOffset > 0) {
      monthPanelOffset = 0;
    }
    this.monthPanelDragOffsetRelative = -monthPanelOffset / monthPanelWidth;
    this.monthPanelDragOffset = monthPanelOffset - monthPanelWidth;
    this.renderer.setStyle(this.monthsFeed.nativeElement, 'transform', 'translateX(' + this.monthPanelDragOffset + 'px)');
    this.takePrevNextMonthInOrOutOfAreaDuringDrag();
  }

  public takePrevNextMonthInOrOutOfAreaDuringDrag() {
    // ручное добавление классов во время анимации чтобы не дергать detectChanges
    const prevMonth = this.monthsFeed.nativeElement.querySelector('.previous-month');
    const nextMonth = this.monthsFeed.nativeElement.querySelector('.next-month');
    if (this.monthPanelDragOffsetRelative > 0) {
      if (nextMonth.classList.contains('out-of-area')) {
        this.renderer.removeClass(nextMonth, 'out-of-area');
      }
      if (!prevMonth.classList.contains('out-of-area')) {
        this.renderer.addClass(prevMonth, 'out-of-area');
      }
    } else if (this.monthPanelDragOffsetRelative < 0) {
      if (!nextMonth.classList.contains('out-of-area')) {
        this.renderer.addClass(nextMonth, 'out-of-area');
      }
      if (prevMonth.classList.contains('out-of-area')) {
        this.renderer.removeClass(prevMonth, 'out-of-area');
      }
    } else {
      this.renderer.addClass(prevMonth, 'out-of-area');
      this.renderer.addClass(nextMonth, 'out-of-area');
    }
  }

  public finishMonthDragging() {
    const finalizedAnimationDirection = this.monthPanelDragOffsetRelative;
    // 30% ширины месяца достаточно чтобы завершить скролл в заданном направлении, меньший процент возвращает баланс на 0
    const monthPanelWidth = this.calendarContainer.nativeElement.clientWidth;
    const finalOffset = finalizedAnimationDirection > 0.3 ?
      -monthPanelWidth * 2 + 'px' : finalizedAnimationDirection < -0.3 ? '0px' : -monthPanelWidth + 'px';
    const animationPlayer = this.animationBuilder.build([
      style({transform: 'translateX(' + this.monthPanelDragOffset + 'px)'}),
        animate(500, style({transform: 'translateX(' + finalOffset + ')'}))
    ]).create(this.monthsFeed.nativeElement);
    animationPlayer.onDone(() => {
      animationPlayer.destroy();
      if (this.monthsFeed) {
        this.renderer.setStyle(this.monthsFeed.nativeElement, 'transform', 'translateX(' + finalOffset + ')');
      }
      this.handleMonthNavigationAnimationDone(finalizedAnimationDirection > 0.3 ? 1 : finalizedAnimationDirection < -0.3 ? -1 : 0);
      this.changeDetection.detectChanges();
      if (this.monthsFeed) {
        this.renderer.setStyle(this.monthsFeed.nativeElement, 'transform', null);
        this.takePrevNextMonthInOrOutOfAreaDuringDrag();
      }
    });
    this.disposeMonthDraggingListeners();
    animationPlayer.play();
  }

  public disposeMonthDraggingListeners() {
    this.monthPanelDragStartPosition = this.monthPanelDragOffset = null;
    this.monthPanelDragOffsetRelative = 0;
    if (this.monthPanelDragTouchMoveSubscription) {
      // освобождает и отключает все динамические лиснеры
      this.monthPanelDragTouchMoveSubscription.unsubscribe();
    }
    if (this.monthPanelDragTouchEndSubscription) {
      this.monthPanelDragTouchEndSubscription.unsubscribe();
    }
    this.monthPanelDragTouchMoveSubscription = this.monthPanelDragTouchEndSubscription = null;
    return true;
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
    return date && !rangeStart && (moment(date).isBetween(this.range.start, this.range.end)
        || this.isRangeStart(date) || this.isRangeEnd(date));
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

  public hideMonthYearDropdowns(source: Event) {
    const protectedSource = source ? source.target : null;
    if (!protectedSource || this.monthSelector && this.monthSelector.container
        && !this.monthSelector.container.nativeElement.contains(protectedSource)) {
      if (this.monthSelector) {
        this.monthSelector.hide();
      }
    }
    if (!protectedSource || this.yearsSelector && this.yearsSelector.container
        && !this.yearsSelector.container.nativeElement.contains(protectedSource)) {
      if (this.yearsSelector) {
        this.yearsSelector.hide();
      }
    }
  }

  public checkAndCorrectNavigation() {
    if (this.activeMonthYear === null) {
      this.activeMonthYear = MonthYear.fromDate(new Date());
    }
    const allowedYears = this.years.map((year) => year.id as number);
    let requiredYear = this.activeMonthYear.year;
    if (requiredYear < Math.min(...allowedYears)) {
      requiredYear = Math.min(...allowedYears);
    } else if (requiredYear > Math.max(...allowedYears)) {
      requiredYear = Math.max(...allowedYears);
    }
    this.activeMonthYear.year = requiredYear;
    this.activeYear = this.years.find((year) => year.id === requiredYear);
    this.months = this.monthsList.filter((month) => {
      // id с 0
      return this.monthIsInsideBounds(month.id as number, requiredYear);
    });
    const allowedMonths = this.months.map((month) => month.id as number);
    const currentYearMinMonth = Math.min(...allowedMonths);
    const currentYearMaxMonth = Math.max(...allowedMonths);
    let requiredMonth = this.activeMonthYear.month;
    if (!allowedMonths.includes(requiredMonth)) {
      requiredMonth = requiredMonth > currentYearMaxMonth ? currentYearMaxMonth : currentYearMinMonth;
    }
    this.activeMonthYear.month = requiredMonth;
    this.activeMonth = this.months.find((month) => month.id === this.activeMonthYear.month);
    this.prevMonthAvailable = !(requiredYear === moment(this.minimumDate).year() && requiredMonth === currentYearMinMonth);
    this.nextMonthAvailable = !(requiredYear === moment(this.maximumDate).year() && requiredMonth === currentYearMaxMonth);
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
    const minimumYear = moment(this.minimumDate).year();
    this.maximumDate = this.getMaximumDate();
    if (this.maximumDate < this.minimumDate) {
      this.maximumDate = this.minimumDate;
    }
    const maximumYear = moment(this.maximumDate).year();
    this.years = Array.from(Array(maximumYear - minimumYear + 1).keys()).map((yearFromMinYear) => {
      const year = minimumYear + yearFromMinYear;
      return new ListItem({id: year, text: year});
    });
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

  private monthIsInsideBounds(month: number, year: number) {
    const firstMonthDay = moment().year(year).month(month).startOf('month').startOf('day');
    const lastMonthDay = moment().year(year).month(month).endOf('month').startOf('day');
    return firstMonthDay.isBetween(this.minimumDate, this.maximumDate, null, '[]')
        || lastMonthDay.isBetween(this.minimumDate, this.maximumDate, null, '[]')
        || moment(this.minimumDate).isBetween(firstMonthDay, lastMonthDay, null, '[]')
        || moment(this.maximumDate).isBetween(firstMonthDay, lastMonthDay, null, '[]');
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
        const date = moment(firstDayOfMonth).add(i - firstDayOfWeekInMonth, 'day');
        output[0].push({day: date.date(), date: date.toDate()});
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
    let days = 0;
    while (output[week].length < 7) {
      const date = moment(firstDayOfMonth).add(1, 'month').add(days++, 'day');
      output[week].push({day: date.date(), date: date.toDate()});
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
    } else {
      this.recover();
    }
  }

}

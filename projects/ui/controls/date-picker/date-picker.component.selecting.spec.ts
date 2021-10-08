import { async, tick, fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePickerComponent } from './date-picker.component';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { SimpleSelectComponent } from '../simple-select/simple-select.component';
import { InvalidResultsTipComponent } from '../../components/invalid-results-tip/invalid-results-tip.component';
import { QuestionHelpTipComponent } from '../../base/question-help-tip/question-help-tip.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
import { Range, MonthYear } from '../../models/date-time.model';
import { BrokenDateFixStrategy } from '../../models/common-enums';
import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import * as moment_ from 'moment';
const moment = moment_;
const STD = 'DD-MM-YYYY';
const SCROLLBAR_UPDATE_TIMING = 50;

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelDateComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  private valueInternal = moment('16-09-2019', STD).toDate();
  public get value() {
    return this.valueInternal;
  }
  public set value(value: Date) {
    this.valueInternal = value;
  }
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelTextComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = '16-09-2019';
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelRangeComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  private valueInternal = new Range<Date>(moment('10-10-2019', STD).toDate(), moment('12-10-2019', STD).toDate());
  public get value() {
    return this.valueInternal;
  }
  public set value(value: Range<Date>) {
    this.valueInternal = value;
  }
}

function doubleTick(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

function waitPanel(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick(SCROLLBAR_UPDATE_TIMING);
  fixture.detectChanges();
}

function waitAnimation(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick(300);
  fixture.detectChanges();
}

describe('DatePickerComponent selecting', () => {

  let component: NgModelDateComponent;
  let fixture: ComponentFixture<NgModelDateComponent>;
  let datePicker: DatePickerComponent;
  let icon: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
      declarations: [
        DatePickerComponent, StandardMaskedInputComponent, SimpleSelectComponent, InvalidResultsTipComponent,
        QuestionHelpTipComponent, ClickOutsideDirective, LibTranslatePipe, AppTranslatePipe, PipedMessagePipe,
        NgModelDateComponent, NgModelTextComponent, NgModelRangeComponent
      ],
      providers: [
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]

    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    component = fixture.componentInstance;
    datePicker = component.datePicker;
    icon = fixture.nativeElement.querySelector('.calendar-icon');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  it('should open the month with actual range start when opening', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    rangeDatePicker.openCalendar();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
  }));

  it('should open the month with actual selected date when opening', fakeAsync(() => {
    datePicker.openCalendar();
    waitPanel(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(8, 2019));
  }));

  it('should open with today date when opening without model value', fakeAsync(() => {
    component.value = null;
    datePicker.minDate = 'start of year';
    datePicker.maxDate = 'end of year';
    datePicker.update();
    doubleTick(fixture);
    datePicker.openCalendar();
    waitPanel(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(moment().month(), moment().year()));
    const today = fixture.nativeElement.querySelectorAll('.current-month .calendar-day.today');
    expect(today.length).toBe(1);
    expect(today[0].textContent).toBe('' + moment().date());
  }));

  it('should highlight selected date when opened', fakeAsync(() => {
    datePicker.openCalendar();
    waitPanel(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(8, 2019));
    const selected = fixture.nativeElement.querySelectorAll('.calendar-day.selected');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toBe('16');
  }));

  it('should highlight selected date when opened (text model)', fakeAsync(() => {
    const textFixture = TestBed.createComponent(NgModelTextComponent);
    doubleTick(textFixture);
    const textDatePicker = textFixture.componentInstance.datePicker;
    textDatePicker.openCalendar();
    waitPanel(textFixture);
    expect(textDatePicker.activeMonthYear).toEqual(new MonthYear(8, 2019));
    const selected = textFixture.nativeElement.querySelectorAll('.calendar-day.selected');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toBe('16');
  }));

  it('should highlight selected range when opened', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    rangeDatePicker.openCalendar();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
    const selected = rangeFixture.nativeElement.querySelectorAll('.calendar-day.in-range');
    expect(selected.length).toBe(3);
    expect(selected[0].textContent).toBe('10');
    expect(selected[1].textContent).toBe('11');
    expect(selected[2].textContent).toBe('12');
  }));

  it('should mark selected range starting, ending and middle days accordingly', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    rangeDatePicker.openCalendar();
    waitPanel(rangeFixture);
    const inRange = rangeFixture.nativeElement.querySelectorAll('.calendar-day.in-range');
    const rangeStart = rangeFixture.nativeElement.querySelectorAll('.calendar-day.range-start');
    const rangeEnd = rangeFixture.nativeElement.querySelectorAll('.calendar-day.range-end');
    expect(inRange.length).toBe(3);
    expect(rangeStart.length).toBe(1);
    expect(rangeStart[0].textContent).toBe('10');
    expect(rangeEnd.length).toBe(1);
    expect(rangeEnd[0].textContent).toBe('12');
  }));

  it('should mark holidays as holidays, today as today', fakeAsync(() => {
    component.value = null;
    datePicker.minDate = undefined;
    datePicker.maxDate = undefined;
    datePicker.update();
    doubleTick(fixture);
    datePicker.openCalendar();
    waitPanel(fixture);
    const today = fixture.nativeElement.querySelectorAll('.current-month .calendar-day.today');
    expect(today.length).toBe(1);
    expect(today[0].textContent).toBe('' + moment().date());
    const dates = fixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).toBe(moment().endOf('month').date());
    for (let i = 0; i < dates.length; i++) {
      expect(dates[i].textContent).toBe('' + (i + 1));
      const weekDay = moment().startOf('month').add(i, 'day').day();
      if ([0, 6].includes(weekDay)) {
        expect(dates[i].classList.contains('holiday')).toBeTruthy();
      } else {
        expect(dates[i].classList.contains('holiday')).toBeFalsy();
      }
    }
  }));

  it('should let select date from dropdown panel', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(8, 2019));
    const dates = fixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    dates[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(fixture.componentInstance.value).isSame(moment('01-09-2019', STD), 'day')).toBeTruthy();
  }));

  it('should let select range from dropdown panel', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    const rangeIcon = rangeFixture.nativeElement.querySelector('.calendar-icon');
    rangeIcon.click();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
    const dates = rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    expect(dates[5].textContent).toBe('6');
    dates[0].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.selected').length).toBe(1);
    expect(rangeFixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    dates[5].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(rangeFixture.componentInstance.value.start).isSame(moment('01-10-2019', STD), 'day')).toBeTruthy();
    expect(moment(rangeFixture.componentInstance.value.end).isSame(moment('06-10-2019', STD), 'day')).toBeTruthy();
  }));

  it('should let select range from dropdown with reverse date selection order', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    const rangeIcon = rangeFixture.nativeElement.querySelector('.calendar-icon');
    rangeIcon.click();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
    const dates = rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    expect(dates[5].textContent).toBe('6');
    dates[5].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    dates[0].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(rangeFixture.componentInstance.value.start).isSame(moment('01-10-2019', STD), 'day')).toBeTruthy();
    expect(moment(rangeFixture.componentInstance.value.end).isSame(moment('06-10-2019', STD), 'day')).toBeTruthy();
  }));

  it('should let cancel range selection by reopening', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeIcon = rangeFixture.nativeElement.querySelector('.calendar-icon');
    rangeIcon.click();
    waitPanel(rangeFixture);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    const dates = rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    dates[0].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.selected').length).toBe(1);
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.in-range').length).toBe(0);
    rangeIcon.click();
    rangeFixture.detectChanges();
    rangeIcon.click();
    waitPanel(rangeFixture);
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.selected').length).toBe(0);
    expect(moment(rangeFixture.componentInstance.value.start).isSame(moment('10-10-2019', STD), 'day')).toBeTruthy();
    expect(moment(rangeFixture.componentInstance.value.end).isSame(moment('12-10-2019', STD), 'day')).toBeTruthy();
  }));

  it('should let select range from dropdown over selected one', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    const rangeIcon = rangeFixture.nativeElement.querySelector('.calendar-icon');
    rangeIcon.click();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
    const dates = rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates[9].textContent).toBe('10');
    expect(dates[10].textContent).toBe('11');
    dates[9].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.in-range').length).toBe(0);
    dates[10].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(rangeFixture.componentInstance.value.start).isSame(moment('10-10-2019', STD), 'day')).toBeTruthy();
    expect(moment(rangeFixture.componentInstance.value.end).isSame(moment('11-10-2019', STD), 'day')).toBeTruthy();
  }));

  it('should not contain out of range monthes and years in dropdown selectors', fakeAsync(() => {
    datePicker.minDate = moment('10-08-2017', STD).toDate();
    datePicker.maxDate = moment('20-10-2019', STD).toDate();
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    datePicker.yearsSelector.toggle();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const yearsList = fixture.nativeElement.querySelectorAll('.calendar-container .year-selector .select-item:not(.select-field-stub)');
    expect(yearsList.length).toBe(3);
    expect(yearsList[0].textContent).toBe('2017');
    expect(yearsList[1].textContent).toBe('2018');
    expect(yearsList[2].textContent).toBe('2019');
    yearsList[0].click();
    fixture.detectChanges();
    let monthsList = fixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-field-stub)');
    expect(monthsList.length).toBe(5);
    datePicker.yearsSelector.toggle();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    yearsList[2].click();
    fixture.detectChanges();
    monthsList = fixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-field-stub)');
    expect(monthsList.length).toBe(10);
  }));

  it('should preserve month selection on years navigatin when possible', fakeAsync(() => {
    datePicker.minDate = moment('10-08-2018', STD).toDate();
    datePicker.maxDate = moment('20-10-2019', STD).toDate();
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    datePicker.yearsSelector.toggle();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const yearsList = fixture.nativeElement.querySelectorAll('.calendar-container .year-selector .select-item:not(.select-field-stub)');
    expect(yearsList.length).toBe(2);
    yearsList[0].click();
    fixture.detectChanges();
    expect(datePicker.monthSelector.item.id).toBe(8);
    expect(datePicker.activeMonthYear.month).toBe(8);
  }));

  it('should close month selector when year selector opened and vice versa', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    const monthSelector = fixture.nativeElement.querySelector('.calendar-container .month-selector .simple-select-arrow');
    const yearsSelector = fixture.nativeElement.querySelector('.calendar-container .year-selector .simple-select-arrow');
    const monthDropdown = fixture.nativeElement.querySelector('.calendar-container .month-selector .simple-select-list');
    const yearsDropdown = fixture.nativeElement.querySelector('.calendar-container .year-selector .simple-select-list');
    monthSelector.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(monthDropdown.offsetWidth).not.toBe(0);
    yearsSelector.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(monthDropdown.offsetWidth).toBe(0);
    expect(yearsDropdown.offsetWidth).not.toBe(0);
    monthSelector.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(monthDropdown.offsetWidth).not.toBe(0);
    expect(yearsDropdown.offsetWidth).toBe(0);
  }));

  it('should close months and years selector on panel click when dropdown stays opened', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    const panel = fixture.nativeElement.querySelector('.calendar-container .calendar-panel');
    const monthSelector = fixture.nativeElement.querySelector('.calendar-container .month-selector .simple-select-arrow');
    const yearsSelector = fixture.nativeElement.querySelector('.calendar-container .year-selector .simple-select-arrow');
    const monthDropdown = fixture.nativeElement.querySelector('.calendar-container .month-selector .simple-select-list');
    const yearsDropdown = fixture.nativeElement.querySelector('.calendar-container .year-selector .simple-select-list');
    monthSelector.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(monthDropdown.offsetWidth).not.toBe(0);
    panel.click();
    fixture.detectChanges();
    expect(monthDropdown.offsetWidth).toBe(0);
    expect(fixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
    yearsSelector.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(yearsDropdown.offsetWidth).not.toBe(0);
    panel.click();
    fixture.detectChanges();
    expect(yearsDropdown.offsetWidth).toBe(0);
    expect(fixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
  }));

  it('should allow month selection in dropdown', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    datePicker.monthSelector.toggle();
    fixture.detectChanges();
    const monthsList = fixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-field-stub)');
    monthsList[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    const dates = fixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    dates[10].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(fixture.componentInstance.value).isSame(moment('11-03-2019', STD), 'day')).toBeTruthy();
  }));

  it('should allow year selection in dropdown', fakeAsync(() => {
    datePicker.minDate = '01.01.2018';
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    datePicker.yearsSelector.toggle();
    fixture.detectChanges();
    const yearsList = fixture.nativeElement.querySelectorAll('.calendar-container .year-selector .select-item:not(.select-field-stub)');
    yearsList[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    const dates = fixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    dates[10].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(fixture.componentInstance.value).isSame(moment('11-09-2018', STD), 'day')).toBeTruthy();
  }));

  it('should let navigate to prev month', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    const prevMonth = fixture.nativeElement.querySelector('.panel .month-arrow-prev');
    prevMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(7);
    expect(datePicker.monthSelector.item.id).toBe(7);
  }));

  it('should let navigate to next month', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    const nextMonth = fixture.nativeElement.querySelector('.panel .month-arrow-next');
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(9);
    expect(datePicker.monthSelector.item.id).toBe(9);
  }));

  it('should let navigate to prev month until the lower range bound is reached', fakeAsync(() => {
    datePicker.minDate = moment('10-08-2019', STD).toDate();
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const prevMonth = fixture.nativeElement.querySelector('.panel .month-arrow-prev');
    prevMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(7);
    expect(datePicker.monthSelector.item.id).toBe(7);
    prevMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(7);
    expect(datePicker.monthSelector.item.id).toBe(7);
  }));

  it('should let navigate to next month until the upper range bound is reached', fakeAsync(() => {
    datePicker.maxDate = moment('20-10-2019', STD).toDate();
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const nextMonth = fixture.nativeElement.querySelector('.panel .month-arrow-next');
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(9);
    expect(datePicker.monthSelector.item.id).toBe(9);
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear.month).toBe(9);
    expect(datePicker.monthSelector.item.id).toBe(9);
  }));

  it('should let navigate to prev month switching the year if needed', fakeAsync(() => {
    datePicker.minDate = moment('01-12-2018', STD).toDate();
    datePicker.update();
    fixture.componentInstance.value = moment('15-01-2019', STD).toDate();
    doubleTick(fixture);
    icon.click();
    waitPanel(fixture);
    const prevMonth = fixture.nativeElement.querySelector('.panel .month-arrow-prev');
    prevMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(11, 2018));
    expect(datePicker.monthSelector.item.id).toBe(11);
    expect(datePicker.yearsSelector.item.id).toBe(2018);
  }));

  it('should let navigate to next month switching the year if needed', fakeAsync(() => {
    datePicker.maxDate = moment('31-01-2020', STD).toDate();
    datePicker.update();
    fixture.componentInstance.value = moment('15-12-2019', STD).toDate();
    doubleTick(fixture);
    icon.click();
    waitPanel(fixture);
    const nextMonth = fixture.nativeElement.querySelector('.panel .month-arrow-next');
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(0, 2020));
    expect(datePicker.monthSelector.item.id).toBe(0);
    expect(datePicker.yearsSelector.item.id).toBe(2020);
  }));

  it('should not show month/year selectors in simplifiedMonthPanel mode', fakeAsync(() => {
    datePicker.simplifiedMonthPanel = true;
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    expect(fixture.nativeElement.querySelector('.month-selector')).toBeNull();
    expect(fixture.nativeElement.querySelector('.year-selector')).toBeNull();
    expect(datePicker.monthSelector).toBeUndefined();
    expect(datePicker.yearsSelector).toBeUndefined();
  }));

  it('should respect allowed range borders in simplifiedMonthPanel', fakeAsync(() => {
    datePicker.simplifiedMonthPanel = true;
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const nextMonth = fixture.nativeElement.querySelector('.panel .month-arrow-next');
    nextMonth.click();
    waitAnimation(fixture);
    nextMonth.click();
    waitAnimation(fixture);
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(11, 2019));
    nextMonth.click();
    waitAnimation(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(11, 2019));
  }));

  it('should let select dates out of current active month', fakeAsync(() => {
    icon.click();
    waitPanel(fixture);
    const dates = fixture.nativeElement.querySelectorAll('.calendar-container .current-month .calendar-day');
    expect(dates[0].classList.contains('outer')).toBeTruthy();
    dates[0].click();
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(fixture.componentInstance.value).isSame(moment('26-08-2019', STD), 'day')).toBeTruthy();
  }));

  it('should not let select dates out of permitted range', fakeAsync(() => {
    datePicker.minDate = moment('10-09-2019', STD).toDate();
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const dates = fixture.nativeElement.querySelectorAll('.calendar-container .current-month .calendar-day');
    expect(dates[10].classList.contains('locked')).toBeTruthy();
    dates[10].click();
    tick();
    expect(fixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    expect(moment(fixture.componentInstance.value).isSame(moment('16-09-2019', STD), 'day')).toBeTruthy();
  }));

  it('should restrict permitted range bounds with min/maxDate fields', fakeAsync(() => {
    datePicker.minDate = '01.01.2016';
    datePicker.maxDate = '31.12.2018';
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const yearsList: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll(
      '.calendar-container .year-selector .select-item:not(.select-field-stub)'));
    const yearsTexts = yearsList.map((yearEl) => yearEl.textContent);
    expect(yearsTexts.length).toBe(3);
    expect(['2016', '2017', '2018'].every((year) => yearsTexts.includes(year))).toBeTruthy();
    expect(datePicker.activeMonthYear.year).toBe(2018);
    for (let i = 0; i <= 2; i++) {
      datePicker.yearsSelector.toggle();
      tick(SCROLLBAR_UPDATE_TIMING);
      fixture.detectChanges();
      yearsList[i].click();
      fixture.detectChanges();
      const monthsList = fixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-field-stub)');
      expect(monthsList.length).toBe(12);
    }
    expect(moment(datePicker.minimumDate).isSame(moment('01-01-2016', STD), 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(moment('31-12-2018', STD), 'day')).toBeTruthy();
  }));

  it('should restrict permitted range bounds with direct min/max dates', fakeAsync(() => {
    datePicker.minDate = '01.08.2019';
    datePicker.maxDate = '20.09.2019';
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    const yearsList = fixture.nativeElement.querySelectorAll('.calendar-container .year-selector .select-item:not(.select-field-stub)');
    const monthsList = fixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-field-stub)');
    expect(yearsList.length).toBe(1);
    expect(monthsList.length).toBe(2);
    expect(moment(datePicker.minimumDate).isSame(moment('01-08-2019', STD), 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(moment('20-09-2019', STD), 'day')).toBeTruthy();
  }));

  it('should reject range bounds with direct min/max dates in incorrect format', fakeAsync(() => {
    datePicker.minDate = '08/01/2019';
    datePicker.maxDate = '09/20/2019';
    datePicker.update();
    fixture.detectChanges();
    icon.click();
    waitPanel(fixture);
    expect(moment(datePicker.minimumDate).isSame(moment().startOf('year'), 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(moment().endOf('year'), 'day')).toBeTruthy();
  }));

  it('should restrict permitted range bounds with relative min/max dates', fakeAsync(() => {
    datePicker.minDate = '-3y11m2d';
    datePicker.maxDate = '+1y2m27d';
    datePicker.update();
    fixture.detectChanges();
    const minDate = moment().add(-3, 'year').add(-11, 'month').add(-2, 'day');
    const maxDate = moment().add(1, 'year').add(2, 'month').add(27, 'day');
    expect(moment(datePicker.minimumDate).isSame(minDate, 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(maxDate, 'day')).toBeTruthy();
  }));

  it('should restrict permitted range bounds with relative min/max dates with skipped positions', fakeAsync(() => {
    datePicker.minDate = '-7m';
    datePicker.maxDate = '+12y21d';
    datePicker.update();
    fixture.detectChanges();
    const minDate = moment().add(-7, 'month');
    const maxDate = moment().add(12, 'year').add(21, 'day');
    expect(moment(datePicker.minimumDate).isSame(minDate, 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(maxDate, 'day')).toBeTruthy();
  }));

  it('should restrict permitted range bounds with mixed properties', fakeAsync(() => {
    datePicker.minDate = '01.01.2015';
    datePicker.maxDate = '+3m7d';
    datePicker.update();
    fixture.detectChanges();
    const minDate = moment('01-01-2015', STD);
    const maxDate = moment().add(3, 'month').add(7, 'day');
    expect(moment(datePicker.minimumDate).isSame(minDate, 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(maxDate, 'day')).toBeTruthy();
  }));

  it('should restrict permitted range with current year if no restrictions is set', fakeAsync(() => {
    datePicker.minDate = undefined;
    datePicker.maxDate = undefined;
    datePicker.update();
    fixture.detectChanges();
    const currentYear = moment().year();
    expect(moment(datePicker.minimumDate).isSame(moment('01-01-' + currentYear, STD), 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(moment('31-12-' + currentYear, STD), 'day')).toBeTruthy();
  }));

  it('should restrict permitted range with defaults from the side that is not property set up', fakeAsync(() => {
    datePicker.minDate = undefined;
    datePicker.maxDate = '+3m7d';
    datePicker.update();
    fixture.detectChanges();
    const minDate = moment('01-01-' + moment().year(), STD);
    const maxDate = moment().add(3, 'month').add(7, 'day');
    expect(moment(datePicker.minimumDate).isSame(minDate, 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(maxDate, 'day')).toBeTruthy();
  }));

  it('should respect relative date constant today', fakeAsync(() => {
    datePicker.minDate = 'today';
    datePicker.maxDate = '+19d';
    datePicker.update();
    fixture.detectChanges();
    const maxDate = moment().add(19, 'day');
    expect(moment(datePicker.minimumDate).isSame(new Date(), 'day')).toBeTruthy();
    expect(moment(datePicker.maximumDate).isSame(maxDate, 'day')).toBeTruthy();
  }));

  it('should let select date when dropdown opened programmatically via openCalendar call', fakeAsync(() => {
    datePicker.openCalendar();
    waitPanel(fixture);
    expect(datePicker.activeMonthYear).toEqual(new MonthYear(8, 2019));
    const dates = fixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    dates[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(fixture.componentInstance.value).isSame(moment('01-09-2019', STD), 'day')).toBeTruthy();
  }));

  it('should let select range when dropdown opened programmatically via openCalendar call', fakeAsync(() => {
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    const rangeDatePicker = rangeFixture.componentInstance.datePicker;
    rangeDatePicker.openCalendar();
    waitPanel(rangeFixture);
    expect(rangeDatePicker.activeMonthYear).toEqual(new MonthYear(9, 2019));
    const dates = rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
    expect(dates.length).not.toBe(0);
    expect(dates[0].textContent).toBe('1');
    expect(dates[5].textContent).toBe('6');
    dates[0].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelectorAll('.current-month .calendar-day.selected').length).toBe(1);
    expect(rangeFixture.nativeElement.querySelector('.calendar-container').offsetWidth).not.toBe(0);
    dates[5].click();
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
    expect(moment(rangeFixture.componentInstance.value.start).isSame(moment('01-10-2019', STD), 'day')).toBeTruthy();
    expect(moment(rangeFixture.componentInstance.value.end).isSame(moment('06-10-2019', STD), 'day')).toBeTruthy();
  }));

  it('should allow quickly clean the date by button if clearable', fakeAsync(() => {
    const emptyDateText = '__.__.____';
    datePicker.clearable = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.text-input').value).not.toBe(emptyDateText);
    expect(component.value).not.toBeNull();
    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).not.toBeNull();
    clearButton.click();
    doubleTick(fixture);
    expect(fixture.nativeElement.querySelector('.text-input').value).toBe(emptyDateText);
    expect(component.value).toBeNull();
    expect(fixture.nativeElement.querySelector('.clear-button')).toBeNull();
  }));

  it('should allow quickly clean the range by button if clearable', fakeAsync(() => {
    const emptyRangeText = '__.__.____-__.__.____';
    const rangeFixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(rangeFixture);
    rangeFixture.componentInstance.datePicker.clearable = true;
    rangeFixture.detectChanges();
    expect(rangeFixture.nativeElement.querySelector('.text-input').value).not.toBe(emptyRangeText);
    expect(rangeFixture.componentInstance.value).not.toBeNull();
    const clearButton = rangeFixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).not.toBeNull();
    clearButton.click();
    doubleTick(rangeFixture);
    expect(rangeFixture.nativeElement.querySelector('.text-input').value).toBe(emptyRangeText);
    expect(rangeFixture.componentInstance.value).toBeNull();
    expect(rangeFixture.nativeElement.querySelector('.clear-button')).toBeNull();
  }));
});

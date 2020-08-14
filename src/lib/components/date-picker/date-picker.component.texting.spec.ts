import { async, tick, fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePickerComponent } from './date-picker.component';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { SimpleSelectComponent } from '../simple-select/simple-select.component';
import { InvalidResultsTipComponent } from '../invalid-results-tip/invalid-results-tip.component';
import { QuestionHelpTipComponent } from '../question-help-tip/question-help-tip.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
import { Range } from '../../models/date-time.model';
import { BrokenDateFixStrategy } from '../../models/common-enums';
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
  public value = moment('16-09-2019', STD).toDate();
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelRangeComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = new Range<Date>(moment('16-09-2019', STD).toDate(), moment('20-09-2019', STD).toDate());
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelTextDateComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = '16.09.2019';
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value"
    [isRange]="true" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelTextRangeComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = new Range<string>('16-09-2019', '20-09-2019');
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value" [shortYearFormat]="true"
    [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelDateShortYearComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = moment('16-09-2019', STD).toDate();
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value" [shortYearFormat]="true" [americanFormat]="true"
    [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelDateShortYearAmericanComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = moment('16-09-2019', STD).toDate();
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value" [shortYearFormat]="true"
    [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelRangeShortYearComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = new Range<Date>(moment('16-09-2019', STD).toDate(), moment('20-09-2019', STD).toDate());
}

@Component({
  template: `<lib-date-picker #datePicker [(ngModel)]="value" [shortYearFormat]="true" [americanFormat]="true"
    [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
})
class NgModelRangeShortYearAmericanComponent {
  @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
  public value = new Range<Date>(moment('16-09-2019', STD).toDate(), moment('20-09-2019', STD).toDate());
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

describe('DatePickerComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
      declarations: [
        DatePickerComponent, StandardMaskedInputComponent, SimpleSelectComponent, PipedMessagePipe,
        InvalidResultsTipComponent, QuestionHelpTipComponent, ClickOutsideDirective, LibTranslatePipe, AppTranslatePipe,
        NgModelDateComponent, NgModelRangeComponent, NgModelTextDateComponent, NgModelTextRangeComponent,
        NgModelDateShortYearComponent, NgModelDateShortYearAmericanComponent,
        NgModelRangeShortYearComponent, NgModelRangeShortYearAmericanComponent
      ],
      providers: [
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]

    }).compileComponents();
  }));

  it('should let enter date manually by text entering', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-2019', STD))).toBeTruthy();
    expect(input.value).toBe('17.09.2019');
  }));

  it('should let enter range manually by text entering', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '21.09.2019-24.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('21-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('24-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value.start).isSame(moment('21-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('24-09-2019', STD))).toBeTruthy();
    expect(input.value).toBe('21.09.2019-24.09.2019');
  }));

  it('should let enter text date manually by text entering', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextDateComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBe('17.09.2019');
    doubleTick(fixture);
    expect(fixture.componentInstance.value).toBe('17.09.2019');
    expect(input.value).toBe('17.09.2019');
  }));

  it('should let enter text range manually by text entering', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextRangeComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '21.09.2019-24.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value.start).toBe('21.09.2019');
    expect(fixture.componentInstance.value.end).toBe('24.09.2019');
    doubleTick(fixture);
    expect(fixture.componentInstance.value.start).toBe('21.09.2019');
    expect(fixture.componentInstance.value.end).toBe('24.09.2019');
    expect(input.value).toBe('21.09.2019-24.09.2019');
  }));

  it('should not let enter date or range by texting if it is denied by textEditable', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.textEditable = false;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('16-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('16-09-2019', STD))).toBeTruthy();
    expect(input.value).toBe('16.09.2019');
  }));

  it('should reorder (sort) dates for range input by default', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '24.09.2019-21.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('21-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('24-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value.start).isSame(moment('21-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('24-09-2019', STD))).toBeTruthy();
    expect(input.value).toBe('21.09.2019-24.09.2019');
  }));

  it('should find the most close date when entering OUTOFBOUND date in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('01-01-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('01-01-2019', STD))).toBeTruthy();
    expect(input.value).toBe('01.01.2019');
  }));

  it('should reset OUTOFBOUND date in RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
  }));

  it('should take OUTOFBOUND date in NONE strategy, but mark component as invalid', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-2018', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('17.09.2018');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should restore previous value when entered INVALID date in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '31.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('16-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019');
  }));

  it('should reset INVALID date if enteredin RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '31.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
  }));

  it('should take, try to parse and commit INVALID date as is in NONE strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '31.09.2018';
    input.dispatchEvent(TestEvents.change());
    expect(isNaN(fixture.componentInstance.value.getTime())).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('31.09.2018');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should restore previous value when entered INCOMPLETE date in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.____';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value).isSame(moment('16-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019');
  }));

  it('should reset INCOMPLETE date in RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.____';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
  }));

  it('should reset INCOMPLETE date, but not the field state in NONE strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.____';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('17.09.____');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should accept and commit INCOMPLETE date in NONE strategy for TEXT model', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextDateComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.____';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBe('17.09.____');
    doubleTick(fixture);
    expect(input.value).toBe('17.09.____');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should align to the accepted range OUTOFBOUND range dates in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2018-20.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('01-01-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('01.01.2019-20.09.2019');
  }));

  it('should reset OUTOFBOUND range in RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2018-20.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.__.____');
  }));

  it('should take OUTOFBOUND range date in NONE strategy, but mark component as inconsistent', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2018-20.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('16-09-2018', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2018-20.09.2019');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should restore previous value when entered INVALID range date in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2019-31.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('16-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-20.09.2019');
  }));

  it('should reset INVALID dates range if entered in RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2019-31.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.__.____');
  }));

  it('should take, try to parse and commit INVALID dates in range as is in NONE strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '16.09.2019-31.09.2019';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('16-09-2019', STD))).toBeTruthy();
    expect(isNaN(fixture.componentInstance.value.end.getTime())).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-31.09.2019');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should restore previous value when entered INCOMPLETE range in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '17.09.2019-30._9.____';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('16-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-20.09.2019');
  }));

  it('should reset INCOMPLETE range in RESET strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESET;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '17.09.2019-30._9.____';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.__.____');
  }));

  it('should take INCOMPLETE range and parse it partially, but not clear the field in NONE strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '17.09.2019-30._9.____';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('17-09-2019', STD))).toBeTruthy();
    expect(fixture.componentInstance.value.end).toBeNull();
    doubleTick(fixture);
    expect(input.value).toBe('17.09.2019-30._9.____');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should accept and commit INCOMPLETE range in NONE strategy for TEXT model', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '17.09.2019-30._9.____';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value.start).toBe('17.09.2019');
    expect(fixture.componentInstance.value.end).toBe('30._9.____');
    doubleTick(fixture);
    expect(input.value).toBe('17.09.2019-30._9.____');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should replace placeholder char for TEXT model for complete dates', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextRangeComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '17._9.2019-30._9.2019';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value.start).toBe('17.9.2019');
    expect(fixture.componentInstance.value.end).toBe('30.9.2019');
    doubleTick(fixture);
    expect(input.value).toBe('17._9.2019-30._9.2019');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeFalsy();
  }));

  it('should not fix any invalid input when strategy is NONE and model is TEXT', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '31._2.2014-20.0_.___1';
    input.dispatchEvent(TestEvents.change());
    expect(fixture.componentInstance.value.start).toBe('31.2.2014');
    expect(fixture.componentInstance.value.end).toBe('20.0_.___1');
    doubleTick(fixture);
    expect(input.value).toBe('31._2.2014-20.0_.___1');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should allow committing invalid and outranged dates (for date-like input) when strategy is NONE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '31._2.2019-20._7.2020';
    input.dispatchEvent(TestEvents.change());
    expect(isNaN(fixture.componentInstance.value.start.getTime())).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-07-2020', STD), 'day')).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('31._2.2019-20._7.2020');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
  }));

  it('should remove inconsistent flag when correct value is committed in NONE strategy', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelTextRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.NONE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '31._2.2019-20._7.2020';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(fixture.componentInstance.datePicker.inconsistent).toBeTruthy();
    input.value = '15._9.2019-17.9_.2019';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(fixture.componentInstance.value.start).toBe('15.9.2019');
    expect(fixture.componentInstance.value.end).toBe('17.9.2019');
    expect(input.value).toBe('15._9.2019-17.9_.2019');
    expect(fixture.componentInstance.datePicker.inconsistent).toBeFalsy();
  }));

  it('should preserve value if its dropped by texting and not allowed by clearable in RESTORE', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.brokenDateFixStrategy = BrokenDateFixStrategy.RESTORE;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019-20.09.2019');
    input.value = '__.__.____-__.__.____';
    input.dispatchEvent(TestEvents.change());
    expect(moment(fixture.componentInstance.value.start).isSame(moment('16-09-2019', STD))).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('20-09-2019', STD))).toBeTruthy();
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-20.09.2019');
  }));

  it('should try to enter value (commit or restore) by pressing enter without dropdown closing', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.2019');
    input.value = '17.09.2019';
    TestEvents.enter(input);
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-2019', STD))).toBeTruthy();
    expect(input.value).toBe('17.09.2019');
  }));

  it('should block invalid characters entered according to mask', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'KeyA', 'a');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
    TestEvents.setCaretPosition(input, 3);
    TestEvents.pressSymbol(input, 'KeyA', 'a');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
  }));

  it('should block numbers more than ever possible for day', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit4', '4');
    doubleTick(fixture);
    expect(input.value).toBe('4_.__.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('4_.__.____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('3_.__.____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('3_.__.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('31.__.____');
  }));

  it('should block numbers more than ever possible for month', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    TestEvents.setCaretPosition(input, 3);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__.3_.____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__.3_.____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.1_.____');
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('__.1_.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.11.____');
  }));

  it('should block number more than ever possible for days in range', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.isRange = true;
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('__.__.____-__.__.____');
    TestEvents.setCaretPosition(input, 11);
    TestEvents.pressSymbol(input, 'Digit4', '4');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-4_.__.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-4_.__.____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-3_.__.____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-3_.__.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-31.__.____');
  }));

  it('should block numbers more than ever possible for month in range', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.isRange = true;
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('__.__.____-__.__.____');
    TestEvents.setCaretPosition(input, 14);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.3_.____');
    TestEvents.pressSymbol(input, 'Digit2', '2');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.3_.____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.1_.____');
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.1_.____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____-__.11.____');
  }));

  it('should block numbers more than ever possible for day in american format', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.americanFormat = true;
    fixture.componentInstance.update();
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    TestEvents.setCaretPosition(input, 3);
    TestEvents.pressSymbol(input, 'Digit4', '4');
    doubleTick(fixture);
    expect(input.value).toBe('__/4_/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/4_/____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__/3_/____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__/3_/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/31/____');
  }));

  it('should block numbers more than ever possible for month in american format', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.americanFormat = true;
    fixture.componentInstance.update();
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit2', '2');
    doubleTick(fixture);
    expect(input.value).toBe('2_/__/____');
    TestEvents.pressSymbol(input, 'Digit0', '0');
    doubleTick(fixture);
    expect(input.value).toBe('2_/__/____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('1_/__/____');
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('1_/__/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('11/__/____');
  }));

  it('should block number more than ever possible for days in range in american format', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.isRange = true;
    fixture.componentInstance.americanFormat = true;
    fixture.componentInstance.update();
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('__/__/____-__/__/____');
    TestEvents.setCaretPosition(input, 14);
    TestEvents.pressSymbol(input, 'Digit4', '4');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-__/4_/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-__/4_/____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-__/3_/____');
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-__/3_/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-__/31/____');
  }));

  it('should block numbers more than ever possible for month in range for anerican format', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.isRange = true;
    fixture.componentInstance.americanFormat = true;
    fixture.componentInstance.update();
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('__/__/____-__/__/____');
    TestEvents.setCaretPosition(input, 11);
    TestEvents.pressSymbol(input, 'Digit3', '2');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-2_/__/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-2_/__/____');
    TestEvents.pressBackspace(input);
    doubleTick(fixture);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-1_/__/____');
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-1_/__/____');
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('__/__/____-11/__/____');
  }));

  it('should let replace last symbol of any group (day/month/year) when entering date', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.textModelValue = true;
    doubleTick(fixture);
    fixture.componentInstance.writeValue('16.09.2019');
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('16.09.2019');
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('13.09.2019');
    TestEvents.setCaretPosition(input, 4);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('13.01.2019');
    TestEvents.setCaretPosition(input, 9);
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('13.01.2018');
  }));

  it('should let replace last symbol of any group (day/month/year) when entering date in range', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.textModelValue = true;
    fixture.componentInstance.isRange = true;
    doubleTick(fixture);
    fixture.componentInstance.writeValue(new Range<string>('16.09.2019', '17.09.2019'));
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('16.09.2019-17.09.2019');
    TestEvents.setCaretPosition(input, 12);
    TestEvents.pressSymbol(input, 'Digit3', '8');
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-18.09.2019');
    TestEvents.setCaretPosition(input, 15);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-18.01.2019');
    TestEvents.setCaretPosition(input, 20);
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('16.09.2019-18.01.2018');
  }));

  it('should let replace last symbol of any group (day/month/year) when entering date in american format', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentInstance.americanFormat = true;
    fixture.componentInstance.textModelValue = true;
    fixture.componentInstance.update();
    doubleTick(fixture);
    fixture.componentInstance.writeValue('09/16/2019');
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('09/16/2019');
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit3', '3');
    doubleTick(fixture);
    expect(input.value).toBe('03/16/2019');
    TestEvents.setCaretPosition(input, 4);
    TestEvents.pressSymbol(input, 'Digit1', '1');
    doubleTick(fixture);
    expect(input.value).toBe('03/11/2019');
    TestEvents.setCaretPosition(input, 9);
    TestEvents.pressSymbol(input, 'Digit8', '8');
    doubleTick(fixture);
    expect(input.value).toBe('03/11/2018');
  }));

  it('should restrict entering _0 and 00 as day and month', fakeAsync(() => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    TestEvents.focus(input);
    waitPanel(fixture);
    expect(input.value).toBe('__.__.____');
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit0', '0');
    doubleTick(fixture);
    expect(input.value).toBe('__.__.____');
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit0', '0');
    doubleTick(fixture);
    expect(input.value).toBe('0_.__.____');
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit0', '0');
    doubleTick(fixture);
    expect(input.value).toBe('0_.__.____');
  }));

  it('should allow entering date in shortYear mode', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateShortYearComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.19');
    input.value = '17.09.19';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-2019', STD), 'day')).toBeTruthy();
  }));

  it('should commit full year when committing value in shortYear mode', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateShortYearComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.minDate = '01.01.1950';
    fixture.componentInstance.datePicker.update();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.19');
    input.value = '17.09.62';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-1962', STD), 'day')).toBeTruthy();
  }));

  it('should allow entering date in american format', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelDateShortYearAmericanComponent);
    doubleTick(fixture);
    fixture.componentInstance.datePicker.minDate = '01.01.1950';
    fixture.componentInstance.datePicker.update();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('09/16/19');
    input.value = '09/17/62';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value).isSame(moment('17-09-1962', STD), 'day')).toBeTruthy();
  }));

  it('should allow entering range in shortYear format', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeShortYearComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('16.09.19-20.09.19');
    input.value = '25.09.19-17.09.19';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value.start).isSame(moment('17-09-2019', STD), 'day')).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('25-09-2019', STD), 'day')).toBeTruthy();
    expect(input.value).toBe('17.09.19-25.09.19');
  }));

  it('should allow entering range in american format with shortYear', fakeAsync(() => {
    const fixture = TestBed.createComponent(NgModelRangeShortYearAmericanComponent);
    doubleTick(fixture);
    const input = fixture.nativeElement.querySelector('.text-input');
    expect(input.value).toBe('09/16/19-09/20/19');
    input.value = '09/25/18-09/17/19';
    input.dispatchEvent(TestEvents.change());
    doubleTick(fixture);
    expect(moment(fixture.componentInstance.value.start).isSame(moment('01-01-2019', STD), 'day')).toBeTruthy();
    expect(moment(fixture.componentInstance.value.end).isSame(moment('17-09-2019', STD), 'day')).toBeTruthy();
    expect(input.value).toBe('01/01/19-09/17/19');
  }));
});

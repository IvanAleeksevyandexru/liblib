// import { async, tick, fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
// import { Component, ViewChild } from '@angular/core';
// import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { DatePickerComponent } from './date-picker.component';
// import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
// import { SimpleSelectComponent } from '../simple-select/simple-select.component';
// import { InvalidResultsTipComponent } from '../../components/invalid-results-tip/invalid-results-tip.component';
// import { QuestionHelpTipComponent } from '../../base/question-help-tip/question-help-tip.component';
// import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { LibTranslateService } from '../../services/translate/translate.service';
// import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
// import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
// import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
// import { Range, MonthYear } from '../../models/date-time.model';
// import { BrokenDateFixStrategy } from '../../models/common-enums';
// import { TestEvents } from '../../mocks/test-events-emulation.stub';
// import * as moment_ from 'moment';
// const moment = moment_;
// const STD = 'DD-MM-YYYY';
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelDateComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = moment('16-09-2019', STD).toDate();
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Date) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelInvalidComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = moment('31-09-2019', STD).toDate();
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Date) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelInvalidTextComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = '95.07.2019';
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: string) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2018" maxDate="31.12.2018"></lib-date-picker>`
// })
// class NgModelOutOfRangedComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = moment('31-01-2020', STD).toDate();
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Date) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelInvalidRangeComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = new Range<Date>(moment('31-06-2019', STD).toDate(), moment('31-07-2019', STD).toDate());
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Range<Date>) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2020" maxDate="31.12.2020"></lib-date-picker>`
// })
// class NgModelOutdatedRangeComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = new Range<Date>(moment('30-06-2019', STD).toDate(), moment('31-07-2019', STD).toDate());
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Range<Date>) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelIncompleteRangeComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private valueInternal = new Range<Date>(moment('31-03-2019', STD).toDate(), null);
//   public get value() {
//     return this.valueInternal;
//   }
//   public set value(value: Range<Date>) {
//     this.valueInternal = value;
//   }
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelTextComponent {
//   public value = '16.09.2019';
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019" [shortYearFormat]="true"></lib-date-picker>`
// })
// class NgModelTextShortComponent {
//   public value = '16.09.2019';
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019" [americanFormat]="true"></lib-date-picker>`
// })
// class NgModelDateAmeComponent {
//   public value = moment('16-09-2019', STD).toDate();
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019" [americanFormat]="true"></lib-date-picker>`
// })
// class NgModelDateAmeTextComponent {
//   public value = '09/16/2019';
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="false" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"
//         [americanFormat]="true" [shortYearFormat]="true"></lib-date-picker>`
// })
// class NgModelDateAmeTextShortComponent {
//   public value = '09/16/2019';
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelRangeComponent {
//   public value = new Range<Date>(moment('16-09-2019', STD).toDate(), moment('30-09-2019', STD).toDate());
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelTextRangeComponent {
//   public value = new Range<string>('16-09-2019', '30-09-2019');
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019" [americanFormat]="true"></lib-date-picker>`
// })
// class NgModelRangeAmeComponent {
//   public value = new Range<Date>(moment('16-09-2019', STD).toDate(), moment('30-09-2019', STD).toDate());
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019" [shortYearFormat]="true"></lib-date-picker>`
// })
// class NgModelTextRangeShortComponent {
//   public value = new Range<string>('16.09.2019', '30.09.2019');
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<div [formGroup]="form"><lib-date-picker #datePicker formControlName="datePicker"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker></div>`
// })
// class FormControlDateComponent {
//   public form = new FormGroup({datePicker: new FormControl(moment('16-09-2019', STD).toDate())});
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<div [formGroup]="form"><lib-date-picker #datePicker formControlName="datePicker"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker></div>`
// })
// class FormControlRangeComponent {
//   public form = new FormGroup({datePicker: new FormControl(
//     new Range<Date>(moment('19-09-2019', STD).toDate(), moment('29-09-2019', STD).toDate()))});
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
// @Component({
//   template: `<div [formGroup]="form"><lib-date-picker #datePicker formControlName="datePicker"
//     [isRange]="true" [textModelValue]="true" minDate="01.01.2019" maxDate="31.12.2019"
//         [americanFormat]="true" [shortYearFormat]="true"></lib-date-picker></div>`
// })
// class FormControlTextRangeComponent {
//   public form = new FormGroup({datePicker: new FormControl(new Range<string>('09/16/2019', '09/30/2019'))});
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
//
// function doubleTick(fixture: ComponentFixture<any>) {
//   fixture.detectChanges();
//   tick();
//   fixture.detectChanges();
//   tick();
//   fixture.detectChanges();
// }
//
// describe('DatePickerComponent', () => {
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule, NoopAnimationsModule ],
//       declarations: [
//         DatePickerComponent, StandardMaskedInputComponent, SimpleSelectComponent, InvalidResultsTipComponent, PipedMessagePipe,
//         QuestionHelpTipComponent, ClickOutsideDirective, LibTranslatePipe, AppTranslatePipe, NgModelDateComponent,
//         NgModelDateAmeComponent, NgModelTextComponent, NgModelTextShortComponent, NgModelDateAmeTextComponent,
//         NgModelDateAmeTextShortComponent, NgModelRangeComponent, NgModelTextRangeComponent, NgModelRangeAmeComponent,
//         NgModelTextRangeShortComponent, FormControlDateComponent, FormControlRangeComponent, FormControlTextRangeComponent,
//         NgModelInvalidComponent, NgModelInvalidTextComponent, NgModelOutOfRangedComponent, NgModelInvalidRangeComponent,
//         NgModelOutdatedRangeComponent, NgModelIncompleteRangeComponent
//       ],
//       providers: [
//         { provide: LibTranslateService, useClass: LibTranslateServiceStub }
//       ]
//     }).compileComponents();
//   }));
//
//   it('should pick up initial value from ngModel', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//   }));
//
//   it('should pick up initial value from reactive form', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlDateComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//   }));
//
//   it('should pick up initial range value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//   }));
//
//   it('should pick up initial text value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//   }));
//
//   it('should pick up initial text range value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//   }));
//
//   it('should pick up initial american format value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateAmeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('09/16/2019');
//   }));
//
//   it('should pick up initial range in american format', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelRangeAmeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('09/16/2019-09/30/2019');
//   }));
//
//   it('should pick up initial shortYear american format text range', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlTextRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('09/16/19-09/30/19');
//   }));
//
//   it('should not commit back (fix) and not highlight broken initial value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelInvalidComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('__.__.____');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(moment().month(), 2019));
//   }));
//
//   it('should not commit back (fix) and not highlight broken initial text value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelInvalidTextComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('95.07.2019');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(moment().month(), 2019));
//   }));
//
//   it('should not commit back (fix) and highlight out of ranged initial value', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelOutOfRangedComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('31.01.2020');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(0, 2018));
//   }));
//
//   it('should not commit back (fix) broken range', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelInvalidRangeComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('__.__.____-31.07.2019');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(moment().month(), 2019));
//   }));
//
//   it('should not commit back (fix) out of range range', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelOutdatedRangeComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('30.06.2019-31.07.2019');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(5, 2020));
//   }));
//
//   it('should not commit back (fix) incomplete range', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelIncompleteRangeComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('31.03.2019-__.__.____');
//     expect(setter).not.toHaveBeenCalled();
//     fixture.componentInstance.datePicker.openCalendar();
//     expect(fixture.componentInstance.datePicker.activeMonthYear).toEqual(new MonthYear(2, 2019));
//   }));
//
//   it('should bind-in to ngModel (date)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     fixture.componentInstance.value = moment('19-09-2019', STD).toDate();
//     doubleTick(fixture);
//     expect(input.value).toBe('19.09.2019');
//   }));
//
//   it('should bind-in to ngModel (text)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     fixture.componentInstance.value = '27.09.2019';
//     doubleTick(fixture);
//     expect(input.value).toBe('27.09.2019');
//   }));
//
//   it('should bind-in to ngModel (range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//     fixture.componentInstance.value = new Range<Date>(moment('03-06-2019', STD).toDate(), moment('07-06-2019', STD).toDate());
//     doubleTick(fixture);
//     expect(input.value).toBe('03.06.2019-07.06.2019');
//   }));
//
//   it('should bind-in to ngModel (text range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//     fixture.componentInstance.value = new Range<string>('03-06-2019', '07-06-2019');
//     doubleTick(fixture);
//     expect(input.value).toBe('03.06.2019-07.06.2019');
//   }));
//
//   it('should bind-in to reactive form (date)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlDateComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     fixture.componentInstance.form.controls.datePicker.setValue(moment('03-06-2019', STD).toDate());
//     doubleTick(fixture);
//     expect(input.value).toBe('03.06.2019');
//   }));
//
//   it('should bind-in to reactive form (range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('19.09.2019-29.09.2019');
//     fixture.componentInstance.form.controls.datePicker.setValue(
//         new Range<Date>(moment('03-06-2019', STD).toDate(), moment('08-06-2019', STD).toDate()));
//     doubleTick(fixture);
//     expect(input.value).toBe('03.06.2019-08.06.2019');
//   }));
//
//   it('should bind-out to ngModel (date)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateComponent);
//     const setter = spyOnProperty(fixture.componentInstance, 'value', 'set').and.callThrough();
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     input.value = '17.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(setter).toHaveBeenCalledTimes(1);
//     expect(moment(fixture.componentInstance.value).isSame(moment('17.09.2019', STD), 'day')).toBeTruthy();
//   }));
//
//   it('should bind-out to ngModel (text)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     input.value = '17.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value).toBe('17.09.2019');
//   }));
//
//   it('should bind-out to ngModel (range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//     input.value = '17.09.2019-29.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(moment(fixture.componentInstance.value.start).isSame(moment('17.09.2019', STD), 'day')).toBeTruthy();
//     expect(moment(fixture.componentInstance.value.end).isSame(moment('29.09.2019', STD), 'day')).toBeTruthy();
//   }));
//
//   it('should bind-out to ngModel (text range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019-30.09.2019');
//     input.value = '17.09.2019-29.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value.start).toBe('17.09.2019');
//     expect(fixture.componentInstance.value.end).toBe('29.09.2019');
//   }));
//
//   it('should bind-out to reactive form (date)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlDateComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.2019');
//     input.value = '17.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(moment(fixture.componentInstance.form.controls.datePicker.value)
//       .isSame(moment('17.09.2019', STD), 'day')).toBeTruthy();
//   }));
//
//   it('should bind-out to reactive form (range)', fakeAsync(() => {
//     const fixture = TestBed.createComponent(FormControlRangeComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('19.09.2019-29.09.2019');
//     input.value = '17.09.2019-29.09.2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(moment(fixture.componentInstance.form.controls.datePicker.value.start).isSame(moment('17-09-2019', STD), 'day')).toBeTruthy();
//     expect(moment(fixture.componentInstance.form.controls.datePicker.value.end).isSame(moment('29-09-2019', STD), 'day')).toBeTruthy();
//   }));
//
//   it('should produce and consume american format in text mode when enabled', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateAmeTextComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('09/16/2019');
//     input.value = '10/17/2019';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value).toBe('10.17.2019');
//   }));
//
//   it('should produce and consume full format in shortYear mode', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextShortComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.19');
//     input.value = '17.09.19';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value).toBe('17.09.2019');
//   }));
//
//   it('should produce and consume full format with shortYear american', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelDateAmeTextShortComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('09/16/19');
//     input.value = '10/17/19';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value).toBe('10.17.2019');
//   }));
//
//   it('should produce and consume full format with shortYear range', fakeAsync(() => {
//     const fixture = TestBed.createComponent(NgModelTextRangeShortComponent);
//     doubleTick(fixture);
//     const input = fixture.nativeElement.querySelector('.text-input');
//     expect(input.value).toBe('16.09.19-30.09.19');
//     input.value = '17.09.19-30.10.19';
//     input.dispatchEvent(TestEvents.change());
//     expect(fixture.componentInstance.value.start).toBe('17.09.2019');
//     expect(fixture.componentInstance.value.end).toBe('30.10.2019');
//   }));
//
// });

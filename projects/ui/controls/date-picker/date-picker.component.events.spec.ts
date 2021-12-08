// import { async, tick, fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
// import { Component, ViewChild, ElementRef } from '@angular/core';
// import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
// import { DatePickerComponent } from './date-picker.component';
// import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
// import { SimpleSelectComponent } from '../simple-select/simple-select.component';
// import { InvalidResultsTipComponent } from '../../components/invalid-results-tip/invalid-results-tip.component';
// import { QuestionHelpTipComponent } from '../../base/question-help-tip/question-help-tip.component';
// import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { LibTranslateService } from '../../services/translate/translate.service';
// import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
// import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
// import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
// import { Range } from '../../models/date-time.model';
// import { BrokenDateFixStrategy } from '../../models/common-enums';
// import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';
// import { TestEvents } from '../../mocks/test-events-emulation.stub';
// import { TestHelper } from '../../mocks/test.helper';
// import * as moment_ from 'moment';
// const moment = moment_;
// const STD = 'DD-MM-YYYY';
// const SCROLLBAR_UPDATE_TIMING = 50;
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value" (changed)="onChange()"
//     [isRange]="false" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelDateComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   public value = moment('16-09-2019', STD).toDate();
//   public onChange() {}
// }
//
// @Component({
//   template: `<lib-date-picker #datePicker [(ngModel)]="value"
//     [isRange]="true" [textModelValue]="false" minDate="01.01.2019" maxDate="31.12.2019"></lib-date-picker>`
// })
// class NgModelRangeComponent {
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
//   private value = new Range<Date>(moment('10-10-2019', STD).toDate(), moment('12-10-2019', STD).toDate());
// }
//
// @Component({
//   template: `<div [formGroup]="form"><lib-date-picker #datePicker minDate="01.01.2019" maxDate="31.12.2019"
//       formControlName="datePicker"></lib-date-picker></div>`
// })
// class FormControlComponent {
//   public form = new FormGroup({datePicker: new FormControl(moment('16-09-2019', STD).toDate())});
//   @ViewChild('datePicker', {static: true}) public datePicker: DatePickerComponent;
// }
//
//
// @Component({
//   template: `<lib-date-picker #managed minDate="01.01.2019" maxDate="31.12.2019" (focus)="otherCalendarFocusReceived()"
//                 (blur)="otherCalendarBlured()" contextClass="managed"></lib-date-picker>
//     <lib-date-picker #datePicker [isRange]="true" minDate="01.01.2019" maxDate="31.12.2019" (focus)="focusReceived()"
//                 (blur)="calendarBlured()" contextClass="base"></lib-date-picker>
//     <input type="text" #unmanaged (focus)="unmanagedFocusReceived()"
//                 (blur)="unmanagedBlured()" class="unmanaged"/>`
// })
// class FocusTestComponent {
//   @ViewChild('managed', {static: true})
//   public managed: DatePickerComponent;
//   @ViewChild('unmanaged', {static: true})
//   public unmanaged: ElementRef;
//   @ViewChild('datePicker', {static: true})
//   public datePicker: DatePickerComponent;
//   public otherCalendarFocusReceived() {}
//   public otherCalendarBlured() {}
//   public focusReceived() {}
//   public calendarBlured() {}
//   public unmanagedFocusReceived() {}
//   public unmanagedBlured() {}
// }
//
// @Component({
//   template: `<lib-date-picker (change)="change()" (input)="input()" (focus)="focus()" (blur)="blur()"
//             (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
//             (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
//                 (mousedown)="mousedown()" (mouseup)="mouseup()"
//             (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
//                 (mouseout)="mouseout()" (mousemove)="mousemove()"></lib-date-picker>`
// })
// class EventTestComponent {
//   public focus() {}
//   public blur() {}
//   public input() {}
//   public keydown() {}
//   public keyup() {}
//   public keypress() {}
//   public touchstart() {}
//   public touchend() {}
//   public touchmove() {}
//   public click() {}
//   public mousedown() {}
//   public mouseup() {}
//   public mouseenter() {}
//   public mouseleave() {}
//   public mouseover() {}
//   public mouseout() {}
//   public mousemove() {}
// }
//
// function doubleTick(fixture: ComponentFixture<any>) {
//   fixture.detectChanges();
//   tick();
//   fixture.detectChanges();
//   tick();
//   fixture.detectChanges();
// }
//
// function waitPanel(fixture: ComponentFixture<any>) {
//   fixture.detectChanges();
//   tick(SCROLLBAR_UPDATE_TIMING);
//   fixture.detectChanges();
// }
//
// function waitAnimation(fixture: ComponentFixture<any>) {
//   fixture.detectChanges();
//   tick(300);
//   fixture.detectChanges();
// }
//
// describe('DatePickerComponent events', () => {
//
//   let component: FocusTestComponent;
//   let fixture: ComponentFixture<FocusTestComponent>;
//   let datePicker: DatePickerComponent;
//   let input: HTMLInputElement;
//   let icon: HTMLElement;
//   let another: DatePickerComponent;
//   let unmanaged: HTMLInputElement;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [ NoopAnimationsModule, FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
//       declarations: [
//         DatePickerComponent, StandardMaskedInputComponent, SimpleSelectComponent, InvalidResultsTipComponent,
//         QuestionHelpTipComponent, ClickOutsideDirective, LibTranslatePipe, AppTranslatePipe, PipedMessagePipe,
//         NgModelDateComponent, NgModelRangeComponent, FocusTestComponent, EventTestComponent, FormControlComponent
//       ],
//       providers: [
//         { provide: LibTranslateService, useClass: LibTranslateServiceStub }
//       ]
//
//     }).compileComponents();
//   }));
//
//   beforeEach(fakeAsync(() => {
//     fixture = TestBed.createComponent(FocusTestComponent);
//     doubleTick(fixture);
//     component = fixture.componentInstance;
//     datePicker = component.datePicker;
//     another = component.managed;
//     unmanaged = component.unmanaged.nativeElement;
//     input = fixture.nativeElement.querySelector('.base .text-input');
//     icon = fixture.nativeElement.querySelector('.base .calendar-icon');
//     fixture.detectChanges();
//     tick();
//     fixture.detectChanges();
//   }));
//
//   it('should open dropdown when receieving focus', fakeAsync(() => {
//     TestEvents.focus(input);
//     waitPanel(fixture);
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//   }));
//
//   it('should open dropdown when icon clicked when unfocused', fakeAsync(() => {
//     expect(document.activeElement).not.toBe(input);
//     icon.click();
//     waitPanel(fixture);
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//   }));
//
//   it('should open dropdown when icon clicked when focused', fakeAsync(() => {
//     TestEvents.focus(input);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     icon.click();  // hide initially shown
//     fixture.detectChanges();
//     let dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).toBeNull();
//     expect(document.activeElement).toBe(input);
//     icon.click();
//     waitPanel(fixture);
//     dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//   }));
//
//   it('should open dropdown when input clicked when unfocused', fakeAsync(() => {
//     TestEvents.focus(input); // click+focus
//     input.click();
//     waitPanel(fixture);
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//   }));
//
//   it('should open dropdown when input clicked when focused', fakeAsync(() => {
//     TestEvents.focus(input);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     input.click();  // hide initially shown by focus dropdown, staying focused
//     fixture.detectChanges();
//     expect(document.activeElement).toBe(input);
//     input.click();
//     waitPanel(fixture);
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//   }));
//
//   it('should hide dropdown on repeated click on input', fakeAsync(() => {
//     TestEvents.focus(input);
//     input.click();
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     input.click();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).toBeNull();
//   }));
//
//   it('should hide dropdown on repeated click on icon', fakeAsync(() => {
//     icon.click();
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     TestEvents.blur(input);
//     icon.click();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     const dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).toBeNull();
//   }));
//
//   it('should hide dropdown when single date selected', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(hostFixture);
//     hostFixture.nativeElement.querySelector('.calendar-icon').click();
//     waitPanel(hostFixture);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//     const dates = hostFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates[0].textContent).toBe('1');
//     dates[0].click();
//     hostFixture.detectChanges();
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
//   }));
//
//   it('should hide dropdown when range selected', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelRangeComponent);
//     doubleTick(hostFixture);
//     hostFixture.nativeElement.querySelector('.calendar-icon').click();
//     waitPanel(hostFixture);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//     const dates = hostFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates[0].textContent).toBe('1');
//     dates[0].click();
//     hostFixture.detectChanges();
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//     dates[1].click();
//     hostFixture.detectChanges();
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
//   }));
//
//   it('should hide dropdown on blur', fakeAsync(() => {
//     datePicker.returnFocus();
//     waitPanel(fixture);
//     expect(document.activeElement).toBe(input);
//     let dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).not.toBeNull();
//     TestEvents.blur(input);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).toBeNull();
//   }));
//
//   it('should hide dropdown when outer control clicked', fakeAsync(() => {
//     TestEvents.focus(input);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     let dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl.offsetWidth).not.toBe(0);
//     unmanaged.click();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     fixture.detectChanges();
//     dropdownEl = fixture.nativeElement.querySelector('.base .calendar-container');
//     expect(dropdownEl).toBeNull();
//   }));
//
//   it('should stay focused when icon clicked', fakeAsync(() => {
//     expect(document.activeElement).not.toBe(input);
//     TestEvents.blur(input);
//     icon.click();
//     tick(SCROLLBAR_UPDATE_TIMING);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(document.activeElement).toBe(input);
//   }));
//
//   it('should stay focused when date selected', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(hostFixture);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     expect(document.activeElement).not.toBe(hostInput);
//     hostFixture.componentInstance.datePicker.returnFocus();
//     waitPanel(hostFixture);
//     const dates = hostFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates[0].textContent).toBe('1');
//     TestEvents.blur(hostInput);
//     dates[0].click();
//     hostFixture.detectChanges();
//     expect(document.activeElement).toBe(hostInput);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).toBeNull();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//   }));
//
//   it('should stay focused when first date of range selected', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelRangeComponent);
//     doubleTick(hostFixture);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     expect(document.activeElement).not.toBe(hostInput);
//     hostFixture.componentInstance.datePicker.returnFocus();
//     waitPanel(hostFixture);
//     const dates = hostFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates[0].textContent).toBe('1');
//     TestEvents.blur(hostInput);
//     dates[0].click();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(document.activeElement).toBe(hostInput);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//   }));
//
//   it('should stay focused when navigating with month switching', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(hostFixture);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     expect(document.activeElement).not.toBe(hostInput);
//     hostFixture.componentInstance.datePicker.returnFocus();
//     waitPanel(hostFixture);
//     const prevButton = hostFixture.nativeElement.querySelector('.calendar-container .month-arrow-prev');
//     const nextButton = hostFixture.nativeElement.querySelector('.calendar-container .month-arrow-next');
//     TestEvents.blur(hostInput);
//     prevButton.click();
//     expect(document.activeElement).toBe(hostInput);
//     waitAnimation(hostFixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//     TestEvents.blur(hostInput);
//     nextButton.click();
//     expect(document.activeElement).toBe(hostInput);
//     waitAnimation(hostFixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//   }));
//
//   it('should stay focused when month or year selected through selectors', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(hostFixture);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     expect(document.activeElement).not.toBe(hostInput);
//     hostFixture.componentInstance.datePicker.returnFocus();
//     waitPanel(hostFixture);
//     const monthSelector = hostFixture.nativeElement.querySelector('.calendar-container .month-selector .simple-select-arrow');
//     const yearsSelector = hostFixture.nativeElement.querySelector('.calendar-container .year-selector .simple-select-arrow');
//     TestEvents.blur(hostInput);
//     monthSelector.click();
//     expect(document.activeElement).toBe(hostInput);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     waitPanel(hostFixture);
//     const months = hostFixture.nativeElement.querySelectorAll('.calendar-container .month-selector .select-item:not(.select-item-stub)');
//     expect(months.length).not.toBe(0);
//     months[0].click();
//     expect(document.activeElement).toBe(hostInput);
//     fixture.detectChanges();
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//     TestEvents.blur(hostInput);
//     yearsSelector.click();
//     expect(document.activeElement).toBe(hostInput);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     waitPanel(hostFixture);
//     const years = hostFixture.nativeElement.querySelectorAll('.calendar-container .year-selector .select-item:not(.select-item-stub)');
//     expect(years.length).not.toBe(0);
//     years[0].click();
//     expect(document.activeElement).toBe(hostInput);
//     fixture.detectChanges();
//     expect(hostFixture.nativeElement.querySelector('.calendar-container')).not.toBeNull();
//   }));
//
//   it('should not open dropdown neighter by focus nor by icon when disabled', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(FormControlComponent);
//     doubleTick(hostFixture);
//     hostFixture.componentInstance.form.controls.datePicker.disable();
//     hostFixture.detectChanges();
//     TestEvents.focus(hostFixture.nativeElement.querySelector('.text-input'));
//     waitPanel(hostFixture);
//     let dropdownEl = hostFixture.nativeElement.querySelector('.calendar-container');
//     expect(dropdownEl).toBeNull();
//     const hostIcon = hostFixture.nativeElement.querySelector('.calendar-icon');
//     hostIcon.click();
//     waitPanel(hostFixture);
//     dropdownEl = hostFixture.nativeElement.querySelector('.calendar-container');
//     expect(dropdownEl).toBeNull();
//     expect(hostFixture.nativeElement.querySelector('.text-input').disabled).toBeTruthy();
//   }));
//
//   it('should emit single focus and no blur event when range selected', fakeAsync(() => {
//     const focusSpy = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurSpy = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     TestEvents.focus(input);
//     input.click();
//     waitPanel(fixture);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     const dates = fixture.nativeElement.querySelectorAll('.base .current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates.length).not.toBe(0);
//     TestEvents.blur(input);
//     dates[0].click();
//     fixture.detectChanges();
//     TestEvents.blur(input);
//     dates[1].click();
//     fixture.detectChanges();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     expect(blurSpy).not.toHaveBeenCalled();
//   }));
//
//   it('should emit single focus and no blur when navigating with month switching', fakeAsync(() => {
//     const focusSpy = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurSpy = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     icon.click();
//     waitPanel(fixture);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     const prevButton = fixture.nativeElement.querySelector('.base .calendar-container .month-arrow-prev');
//     const nextButton = fixture.nativeElement.querySelector('.base .calendar-container .month-arrow-next');
//     TestEvents.blur(input);
//     prevButton.click();
//     waitAnimation(fixture);
//     fixture.detectChanges();
//     TestEvents.blur(input);
//     nextButton.click();
//     waitAnimation(fixture);
//     fixture.detectChanges();
//     input.click();
//     fixture.detectChanges();
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     expect(blurSpy).not.toHaveBeenCalled();
//   }));
//
//   it('should emit single focus and no blur when navigating with month-year selectors', fakeAsync(() => {
//     const focusSpy = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurSpy = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     TestEvents.focus(input);
//     waitPanel(fixture);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     const monthSelector = fixture.nativeElement.querySelector('.base .calendar-container .month-selector .simple-select-arrow');
//     TestEvents.blur(input);
//     monthSelector.click();
//     waitPanel(fixture);
//     const months = fixture.nativeElement.querySelectorAll('.base .calendar-container .month-selector .select-item:not(.select-item-stub)');
//     expect(months.length).not.toBe(0);
//     TestEvents.blur(input);
//     months[0].click();
//     fixture.detectChanges();
//     const dates = fixture.nativeElement.querySelectorAll('.base .current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates.length).not.toBe(0);
//     TestEvents.blur(input);
//     dates[0].click();
//     fixture.detectChanges();
//     TestEvents.blur(input);
//     dates[1].click();
//     fixture.detectChanges();
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     expect(blurSpy).not.toHaveBeenCalled();
//   }));
//
//   it('should emit single blur event after any actions inside control and further leaving', fakeAsync(() => {
//     const focusSpy = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurSpy = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     TestEvents.focus(input);
//     waitPanel(fixture);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     const monthSelector = fixture.nativeElement.querySelector('.base .calendar-container .month-selector .simple-select-arrow');
//     TestEvents.blur(input);
//     monthSelector.click();
//     waitPanel(fixture);
//     const months = fixture.nativeElement.querySelectorAll('.base .calendar-container .month-selector .select-item:not(.select-item-stub)');
//     expect(months.length).not.toBe(0);
//     TestEvents.blur(input);
//     months[0].click();
//     fixture.detectChanges();
//     const dates = fixture.nativeElement.querySelectorAll('.base .current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates.length).not.toBe(0);
//     TestEvents.blur(input);
//     dates[0].click();
//     fixture.detectChanges();
//     TestEvents.blur(input);
//     dates[1].click();
//     fixture.detectChanges();
//     TestEvents.blur(input);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(focusSpy).toHaveBeenCalledTimes(1);
//     expect(blurSpy).toHaveBeenCalledTimes(1);
//   }));
//
//   it('should receive focus making another managed area controls unfocused', fakeAsync(() => {
//     const managedCalendar = fixture.nativeElement.querySelector('.managed .text-input') as HTMLInputElement;
//     const baseCalendar = fixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
//     const focusListener = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurListener = spyOn(fixture.componentInstance, 'otherCalendarBlured').and.callThrough();
//     TestEvents.focus(managedCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).toBeNull();
//     expect(document.activeElement).not.toBe(baseCalendar);
//     TestEvents.focus(baseCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).not.toBeNull();
//     expect(focusListener).toHaveBeenCalled();
//     expect(blurListener).toHaveBeenCalled();
//     expect(document.activeElement).toBe(baseCalendar);
//   }));
//
//   it('should receive focus making another unmanaged area controls unfocused', fakeAsync(() => {
//     const baseCalendar = fixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
//     const unmanagedInput = fixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
//     const focusListener = spyOn(fixture.componentInstance, 'focusReceived').and.callThrough();
//     const blurListener = spyOn(fixture.componentInstance, 'unmanagedBlured').and.callThrough();
//     TestEvents.focus(unmanagedInput);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).toBeNull();
//     expect(document.activeElement).not.toBe(baseCalendar);
//     TestEvents.focus(baseCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).not.toBeNull();
//     expect(focusListener).toHaveBeenCalled();
//     expect(blurListener).toHaveBeenCalled();
//     expect(document.activeElement).toBe(baseCalendar);
//   }));
//
//   it('should lost focus when another control in managed area receives focus', fakeAsync(() => {
//     const managedCalendar = fixture.nativeElement.querySelector('.managed .text-input') as HTMLInputElement;
//     const baseCalendar = fixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
//     const focusListener = spyOn(fixture.componentInstance, 'otherCalendarFocusReceived').and.callThrough();
//     const blurListener = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     TestEvents.focus(baseCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).not.toBeNull();
//     expect(document.activeElement).toBe(baseCalendar);
//     TestEvents.focus(managedCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).toBeNull();
//     expect(focusListener).toHaveBeenCalled();
//     expect(blurListener).toHaveBeenCalled();
//     expect(document.activeElement).not.toBe(baseCalendar);
//   }));
//
//   it('should lost focus when another control in unmanaged area receives focus', fakeAsync(() => {
//     const baseCalendar = fixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
//     const unmanagedInput = fixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
//     const focusListener = spyOn(fixture.componentInstance, 'unmanagedFocusReceived').and.callThrough();
//     const blurListener = spyOn(fixture.componentInstance, 'calendarBlured').and.callThrough();
//     TestEvents.focus(baseCalendar);
//     waitPanel(fixture);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).not.toBeNull();
//     expect(document.activeElement).toBe(baseCalendar);
//     TestEvents.focus(unmanagedInput);
//     tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
//     fixture.detectChanges();
//     expect(fixture.nativeElement.querySelector('.base .calendar-container')).toBeNull();
//     expect(focusListener).toHaveBeenCalled();
//     expect(blurListener).toHaveBeenCalled();
//     expect(document.activeElement).not.toBe(baseCalendar);
//   }));
//
//   it('should mark touched when first opened', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(FormControlComponent);
//     doubleTick(hostFixture);
//     expect(hostFixture.componentInstance.form.controls.datePicker.touched).toBeFalsy();
//     hostFixture.componentInstance.datePicker.returnFocus();
//     waitPanel(hostFixture);
//     expect(hostFixture.componentInstance.form.controls.datePicker.touched).toBeTruthy();
//   }));
//
//   it('should let transparently pass mouse events through', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(EventTestComponent);
//     doubleTick(hostFixture);
//     const field = hostFixture.nativeElement.querySelector('.text-input') as HTMLElement;
//     const eventHost = hostFixture.componentInstance;
//     const clickedListener = spyOn(eventHost, 'click').and.callThrough();
//     const mousedownListener = spyOn(eventHost, 'mousedown').and.callThrough();
//     const mouseupListener = spyOn(eventHost, 'mouseup').and.callThrough();
//     const mouseenterListener = spyOn(eventHost, 'mouseenter').and.callThrough();
//     const mouseleaveListener = spyOn(eventHost, 'mouseleave').and.callThrough();
//     const mouseoverListener = spyOn(eventHost, 'mouseover').and.callThrough();
//     const mouseoutListener = spyOn(eventHost, 'mouseout').and.callThrough();
//     const mousemoveListener = spyOn(eventHost, 'mousemove').and.callThrough();
//     field.click();
//     waitPanel(hostFixture);
//     expect(clickedListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mousedown());
//     expect(mousedownListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mouseup());
//     expect(mouseupListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mouseenter());
//     expect(mouseenterListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mouseleave());
//     expect(mouseleaveListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mouseover());
//     expect(mouseoverListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mouseout());
//     expect(mouseoutListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.mousemove());
//     expect(mousemoveListener).toHaveBeenCalled();
//   }));
//
//   it('should let transparently pass touch and keyboard events through', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(EventTestComponent);
//     doubleTick(hostFixture);
//     const field = hostFixture.nativeElement.querySelector('.text-input') as HTMLElement;
//     const eventHost = hostFixture.componentInstance;
//     const keydownListener = spyOn(eventHost, 'keydown').and.callThrough();
//     const keyupListener = spyOn(eventHost, 'keyup').and.callThrough();
//     const keypressListener = spyOn(eventHost, 'keypress').and.callThrough();
//     const touchstartListener = spyOn(eventHost, 'touchstart').and.callThrough();
//     const touchendListener = spyOn(eventHost, 'touchend').and.callThrough();
//     const touchmoveListener = spyOn(eventHost, 'touchmove').and.callThrough();
//     field.dispatchEvent(TestEvents.keydown());
//     expect(keydownListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.keyup());
//     expect(keyupListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.keypress());
//     expect(keypressListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.touchstart());
//     expect(touchstartListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.touchend());
//     expect(touchendListener).toHaveBeenCalled();
//     field.dispatchEvent(TestEvents.touchmove());
//     expect(touchmoveListener).toHaveBeenCalled();
//   }));
//
//   it('should emit focus, blur, input events as usual input', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(EventTestComponent);
//     doubleTick(hostFixture);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
//     const eventHost = hostFixture.componentInstance;
//     const focusListener = spyOn(eventHost, 'focus').and.callThrough();
//     const blurListener = spyOn(eventHost, 'blur').and.callThrough();
//     const inputListener = spyOn(eventHost, 'input').and.callThrough();
//     hostInput.dispatchEvent(TestEvents.input());
//     expect(inputListener).toHaveBeenCalledTimes(1);
//     hostInput.dispatchEvent(new Event('focus'));
//     waitPanel(hostFixture);
//     expect(focusListener).toHaveBeenCalledTimes(1);
//     hostInput.dispatchEvent(new Event('blur'));
//     tick(BLUR_TO_FOCUS_COMMON_DELAY);
//     expect(blurListener).toHaveBeenCalledTimes(1);
//   }));
//
//   it('should emit change event when value changed (committed), but not programmatically', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(NgModelDateComponent);
//     doubleTick(hostFixture);
//     const changeListener = spyOn(hostFixture.componentInstance, 'onChange').and.callThrough();
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
//     hostInput.click();
//     waitPanel(hostFixture);
//     const dates = hostFixture.nativeElement.querySelectorAll('.current-month .calendar-day:not(.locked):not(.outer)');
//     expect(dates[0].textContent).toBe('1');
//     dates[0].click();
//     doubleTick(hostFixture);
//     expect(changeListener).toHaveBeenCalledTimes(1);
//     expect(hostInput.value).toBe('01.09.2019');
//     hostInput.value = '05.09.2019';
//     hostInput.dispatchEvent(TestEvents.change());
//     doubleTick(hostFixture);
//     expect(changeListener).toHaveBeenCalledTimes(2);
//     expect(moment(hostFixture.componentInstance.value).isSame(moment('05-09-2019', STD), 'day')).toBeTruthy();
//     hostFixture.componentInstance.value = moment('09-09-2019', STD).toDate();
//     doubleTick(hostFixture);
//     expect(hostInput.value).toBe('09.09.2019');
//     expect(changeListener).toHaveBeenCalledTimes(2);
//   }));
//
//   it('should show tip when provided', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     hostFixture.componentInstance.questionTip = 'this is a tip';
//     doubleTick(hostFixture);
//     const questionIcon = hostFixture.nativeElement.querySelector('.question-icon');
//     expect(questionIcon.offsetWidth).not.toBe(0);
//     TestEvents.focus(hostFixture.nativeElement.querySelector('.text-input'));
//     waitPanel(hostFixture);
//     expect(questionIcon.offsetWidth).not.toBe(0);
//   }));
//
//   it('should show error tip unless untouched or edited now', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.questionTip = 'this is a tip';
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     doubleTick(hostFixture);
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     const questionIcon = hostFixture.nativeElement.querySelector('.question-icon');
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     expect(questionIcon).toBeNull();
//     expect(hostInput.classList.contains('invalid')).toBe(true);
//   }));
//
//   it('should hide error tip if untouched or edited now', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     hostComponent.validationShowOn = 'touched_unfocused';
//     doubleTick(hostFixture);
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     TestEvents.focus(hostInput);
//     waitPanel(hostFixture);
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     expect(hostInput.classList.contains('invalid')).toBeFalsy();
//   }));
//
//   it('should replace error tip with question tip when invalid, but untouched or edited now', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.questionTip = 'this is a tip';
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     hostComponent.validationShowOn = 'touched_unfocused';
//     doubleTick(hostFixture);
//     hostComponent.inputElement.update();
//     let questionIcon = hostFixture.nativeElement.querySelector('.question-icon');
//     expect(questionIcon.offsetWidth).not.toBe(0);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     questionIcon = hostFixture.nativeElement.querySelector('.question-icon');
//     expect(questionIcon).toBeNull();
//     TestEvents.focus(hostInput);
//     waitPanel(hostFixture);
//     questionIcon = hostFixture.nativeElement.querySelector('.question-icon');
//     expect(questionIcon.offsetWidth).not.toBe(0);
//   }));
//
//   it('should show invalid class, but not the error tip when validationMessages not provided', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.validationMessages = null;
//     hostComponent.validation = false;
//     doubleTick(hostFixture);
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     expect(hostInput.classList.contains('invalid')).toBe(true);
//   }));
//
//   it('should force displaying validation results when manualOverride set to true', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     hostComponent.validationShowOn = 'immediate'; // force show if any
//     doubleTick(hostFixture);
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     TestEvents.focus(hostInput);
//     waitPanel(hostFixture);
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     hostComponent.validation = true;
//     doubleTick(hostFixture);
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//   }));
//
//   it('should force hiding validation results when manualOverride set to false', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     hostComponent.validationShowOn = 'never';  // force hide
//     doubleTick(hostFixture);
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     const hostInput = hostFixture.nativeElement.querySelector('.text-input');
//     expect(hostInput.classList.contains('invalid')).toBeFalsy();
//     TestEvents.makeTouched(hostInput);
//     hostFixture.detectChanges();
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(errorIcon).toBe(null);
//     expect(hostInput.classList.contains('invalid')).toBeFalsy();
//   }));
//
//   it('should not show clearButton, validationTip or questionTip and calendarIcon intersected', fakeAsync(() => {
//     const hostFixture = TestBed.createComponent(DatePickerComponent);
//     doubleTick(hostFixture);
//     const hostComponent = hostFixture.componentInstance;
//     hostComponent.questionTip = 'this is a tip';
//     hostComponent.validationMessages = 'error text';
//     hostComponent.validation = false;
//     // show immediately even if untouched
//     hostComponent.validationShowOn = 'immediate';
//     hostComponent.clearable = true;
//     hostComponent.textModelValue = true;
//     hostComponent.writeValue('17.09.2019');
//     doubleTick(hostFixture);
//     let questionTip = hostFixture.nativeElement.querySelector('.question-icon');
//     let errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     const datepickerIcon = hostFixture.nativeElement.querySelector('.calendar-icon');
//     const clearButton = hostFixture.nativeElement.querySelector('.clear-button');
//     expect(questionTip).toBeNull();
//     expect(errorIcon.offsetWidth).not.toBe(0);
//     expect(datepickerIcon.offsetWidth).not.toBe(0);
//     expect(clearButton.offsetWidth).not.toBe(0);
//     expect(TestHelper.isIntersecting(errorIcon.getBoundingClientRect(), datepickerIcon.getBoundingClientRect())).toBeFalsy();
//     expect(TestHelper.isIntersecting(errorIcon.getBoundingClientRect(), clearButton.getBoundingClientRect())).toBeFalsy();
//     expect(TestHelper.isIntersecting(datepickerIcon.getBoundingClientRect(), clearButton.getBoundingClientRect())).toBeFalsy();
//     hostComponent.validation = true;
//     doubleTick(hostFixture);
//     questionTip = hostFixture.nativeElement.querySelector('.question-icon');
//     errorIcon = hostFixture.nativeElement.querySelector('.error-icon');
//     expect(questionTip.offsetWidth).not.toBe(0);
//     expect(errorIcon).toBeNull();
//     expect(TestHelper.isIntersecting(questionTip.getBoundingClientRect(), datepickerIcon.getBoundingClientRect())).toBeFalsy();
//     expect(TestHelper.isIntersecting(questionTip.getBoundingClientRect(), clearButton.getBoundingClientRect())).toBeFalsy();
//     expect(TestHelper.isIntersecting(datepickerIcon.getBoundingClientRect(), clearButton.getBoundingClientRect())).toBeFalsy();
//   }));
//
// });

import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { StandardInputComponent } from './standard-input.component';
import { InvalidResultsTipComponent } from '../invalid-results-tip/invalid-results-tip.component';
import { QuestionHelpTipComponent } from '../question-help-tip/question-help-tip.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';

@Component({
  template: `<lib-standard-input #input [(ngModel)]="value" [commitOnInput]="false"></lib-standard-input>`
})
class NgModelComponent {
  @ViewChild('input', {static: true}) public input: StandardInputComponent;
  private valueInternal = 'original value';
  public get value() {
    return this.valueInternal;
  }
  public set value(value: string) {
    this.valueInternal = value;
  }
}

@Component({
  template: `<div [formGroup]="form"><lib-standard-input formControlName="control" [commitOnInput]="false"></lib-standard-input></div>`
})
class FormControlComponent {
  public form = new FormGroup({control: new FormControl('original value')});
}

@Component({
  template: `<lib-standard-input #managed (focus)="otherInputFocusReceived()"
                (blur)="otherInputBlured()" contextClass="managed"></lib-standard-input>
    <lib-standard-input #input (focus)="focusReceived()"
                (blur)="inputBlured()" contextClass="base"></lib-standard-input>
    <input type="text" #unmanaged (focus)="unmanagedInputFocusReceived()"
                (blur)="unmanagedBlured()" class="unmanaged"/>`
})
class FocusTestComponent {
  @ViewChild('managed', {static: true})
  public managed: StandardInputComponent;
  @ViewChild('unmanaged', {static: true})
  public unmanaged: HTMLInputElement;
  @ViewChild('input', {static: true})
  public input: StandardInputComponent;
  public otherInputFocusReceived() {}
  public otherInputBlured() {}
  public focusReceived() {}
  public inputBlured() {}
  public unmanagedInputFocusReceived() {}
  public unmanagedBlured() {}
}

@Component({
  template: `<lib-standard-input (change)="change()" (input)="input()" (focus)="focus()" (blur)="blur()"
            (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
            (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
                (mousedown)="mousedown()" (mouseup)="mouseup()"
            (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
                (mouseout)="mouseout()" (mousemove)="mousemove()"
            [(ngModel)]="value"></lib-standard-input>`
})
class EventTestComponent {
  public value = '';
  public change() {}
  public input() {}
  public focus() {}
  public blur() {}
  public keydown() {}
  public keyup() {}
  public keypress() {}
  public touchstart() {}
  public touchend() {}
  public touchmove() {}
  public click() {}
  public mousedown() {}
  public mouseup() {}
  public mouseenter() {}
  public mouseleave() {}
  public mouseover() {}
  public mouseout() {}
  public mousemove() {}
}

describe('StandardInputComponent', () => {
  let component: StandardInputComponent;
  let fixture: ComponentFixture<NgModelComponent>;
  let input: HTMLInputElement;
  let ngModel: NgModelComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        InvalidResultsTipComponent, QuestionHelpTipComponent, StandardInputComponent,
        LibTranslatePipe, AppTranslatePipe, PipedMessagePipe,
        NgModelComponent, FormControlComponent, FocusTestComponent, EventTestComponent
      ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(NgModelComponent);
    fixture.detectChanges();
    // ngmodel applies initial value asynchronously, part of angular design,
    // see https://github.com/angular/angular/blob/master/packages/forms/test/template_integration_spec.ts#L29
    tick();
    fixture.detectChanges();
    component = fixture.componentInstance.input;
    ngModel = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should transparently map base attrs to input', () => {
    component.id = 'id';
    component.name = 'name';
    component.type = 'password';
    component.tabIndex = '8';
    component.maxlength = '25';
    component.placeholder = 'Enter text';
    component.autocomplete = 'on';
    component.readOnly = true;
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(input.id).toBe('id');
    expect(input.name).toBe('name');
    expect(input.type).toBe('password');
    expect(input.tabIndex).toBe(8);
    expect(input.maxLength).toBe(25);
    expect(input.placeholder).toBe('Enter text');
    expect(input.autocomplete).toBe('on');
    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
  });

  it('should miss most of base attrs when unset', () => {
    // getAttr is used to distinguish missing attribute (not empty, but missing)
    expect(input.getAttribute('id')).toBe(null);
    expect(input.getAttribute('name')).toBe(null);
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('tabIndex')).toBe(null);
    expect(input.getAttribute('maxlength')).toBe(null);
    expect(input.getAttribute('placeholder')).toBe(null);
    expect(input.getAttribute('autocomplete')).toBe(null);
    expect(input.getAttribute('disabled')).toBe(null);
    expect(input.getAttribute('readOnly')).toBe(null);
  });

  it('should bind-in when used with ngModel', fakeAsync(() => {
    expect(input.value).toBe('original value');
    ngModel.value = 'new model value';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('new model value');
  }));

  it('should bind-out when used with ngModel', () => {
    expect(input.value).toBe('original value');
    expect(ngModel.value).toBe('original value');
    input.value = 'new user value';
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('new user value');
  });

  it('should bind-in when used with reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(input.value).toBe('original value');
    hostFixture.componentInstance.form.controls.control.setValue('new model value');
    hostFixture.detectChanges();
    tick();
    expect(input.value).toBe('new model value');
  }));

  it('should bind-out when used with reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(hostFixture.componentInstance.form.controls.control.value).toBe('original value');
    expect(input.value).toBe('original value');
    input.value = 'new user value';
    input.dispatchEvent(TestEvents.change());
    expect(hostFixture.componentInstance.form.controls.control.value).toBe('new user value');
  }));

  it('should commit value on change if commitOnInput not activated', () => {
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = 'new value';
    input.dispatchEvent(TestEvents.change());
    expect(setter).toHaveBeenCalled();
    input.value = 'another value';
    input.dispatchEvent(TestEvents.change());
    expect(setter).toHaveBeenCalledTimes(2);
    expect(ngModel.value).toBe('another value');
  });

  it('should commit value by symbols if commitOnInput enabled', () => {
    component.commitOnInput = true;
    fixture.detectChanges();
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = 'x';
    input.dispatchEvent(TestEvents.input());
    expect(setter).toHaveBeenCalled();
    input.value = 'xy';
    input.dispatchEvent(TestEvents.input());
    expect(setter).toHaveBeenCalledTimes(2);
    input.value = 'xyz';
    input.dispatchEvent(TestEvents.input());
    expect(setter).toHaveBeenCalledTimes(3);
    expect(ngModel.value).toBe('xyz');
  });

  it('should receive focus making another managed area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const managedInput = hostFixture.nativeElement.querySelector('.managed .text-input') as HTMLInputElement;
    const baseInput = hostFixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'otherInputBlured').and.callThrough();
    component = hostFixture.componentInstance.input;
    TestEvents.focus(managedInput);
    expect(component.focused).toBeFalsy();
    TestEvents.focus(baseInput);
    expect(component.focused).toBeTruthy();
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // required to clear timer
  }));

  it('should receive focus making another unmanaged area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const baseInput = hostFixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'unmanagedBlured').and.callThrough();
    component = hostFixture.componentInstance.input;
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    expect(component.focused).toBeFalsy();
    TestEvents.focus(baseInput);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(component.focused).toBeTruthy();
  }));

  it('should lost focus when another control in managed area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const managedInput = hostFixture.nativeElement.querySelector('.managed .text-input') as HTMLInputElement;
    const baseInput = hostFixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'otherInputFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'inputBlured').and.callThrough();
    component = hostFixture.componentInstance.input;
    TestEvents.focus(baseInput);
    expect(component.focused).toBeTruthy();
    TestEvents.focus(managedInput);
    expect(component.focused).toBeFalsy();
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // required to clear timer
  }));

  it('should lost focus when another control in unmanaged area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const baseInput = hostFixture.nativeElement.querySelector('.base .text-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'unmanagedInputFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'inputBlured').and.callThrough();
    component = hostFixture.componentInstance.input;
    TestEvents.focus(baseInput);
    expect(component.focused).toBeTruthy();
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(component.focused).toBeFalsy();
  }));

  it('should show tip when provided', () => {
    component.questionTip = 'this is a tip';
    fixture.detectChanges();
    const questionIcon = fixture.nativeElement.querySelector('.question-icon');
    expect(questionIcon.offsetWidth).not.toBe(0);
    TestEvents.focus(input);
    expect(questionIcon.offsetWidth).not.toBe(0);
  });

  it('should show error tip unless untouched or edited now', fakeAsync(() => {
    component.questionTip = 'this is a tip';
    component.validationMessages = 'error text';
    component.validation = false;
    component.check();
    fixture.detectChanges();
    let errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    const questionIcon = fixture.nativeElement.querySelector('.question-icon');
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon.offsetWidth).not.toBe(0);
    expect(questionIcon).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  }));

  it('should hide error tip if untouched or edited now', fakeAsync(() => {
    component.validationMessages = 'error text';
    component.validation = false;
    component.validationShowOn = 'touched_unfocused';
    component.check();
    fixture.detectChanges();
    let errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon.offsetWidth).not.toBe(0);
    TestEvents.focus(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    expect(input.classList.contains('invalid')).toBeFalsy();
  }));

  it('should replace error tip with question tip when invalid, but untouched or edited now', fakeAsync(() => {
    component.questionTip = 'this is a tip';
    component.validationMessages = 'error text';
    component.validationShowOn = 'touched_unfocused';
    component.validation = false;
    component.check();
    fixture.detectChanges();
    let questionIcon = fixture.nativeElement.querySelector('.question-icon');
    expect(questionIcon.offsetWidth).not.toBe(0);
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    questionIcon = fixture.nativeElement.querySelector('.question-icon');
    expect(questionIcon).toBeNull();
    TestEvents.focus(input);
    fixture.detectChanges();
    questionIcon = fixture.nativeElement.querySelector('.question-icon');
    expect(questionIcon.offsetWidth).not.toBe(0);
  }));

  it('should show invalid class, but not the error tip when validationMessages not provided', fakeAsync(() => {
    component.validationMessages = null;
    component.validation = false;
    component.check();
    fixture.detectChanges();
    let errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    expect(input.classList.contains('invalid')).toBe(true);
  }));

  it('should force displaying validation results when manualOverride set to true', fakeAsync(() => {
    component.validationMessages = 'error text';
    component.validation = false;
    component.validationShowOn = 'immediate';
    component.check();
    fixture.detectChanges();
    let errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon.offsetWidth).not.toBe(0);
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon.offsetWidth).not.toBe(0);
    TestEvents.focus(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon.offsetWidth).not.toBe(0);
    component.validation = true;
    component.check();
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
  }));

  it('should force hiding validation results when manualOverride set to false', fakeAsync(() => {
    component.validationMessages = 'error text';
    component.validation = false;
    component.validationShowOn = 'never';  // force hide
    fixture.detectChanges();
    let errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    expect(input.classList.contains('invalid')).toBeFalsy();
    TestEvents.makeTouched(input);
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
    expect(input.classList.contains('invalid')).toBeFalsy();
  }));

  it('should mark control as touched when first blured', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(hostFixture.componentInstance.form.controls.control.touched).toBeFalsy();
    TestEvents.makeTouched(input);
    expect(hostFixture.componentInstance.form.controls.control.touched).toBeTruthy();
  }));

  it('should let transparently bubble mouse events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    const eventHost = hostFixture.componentInstance;
    const clickedListener = spyOn(eventHost, 'click').and.callThrough();
    const mousedownListener = spyOn(eventHost, 'mousedown').and.callThrough();
    const mouseupListener = spyOn(eventHost, 'mouseup').and.callThrough();
    const mouseenterListener = spyOn(eventHost, 'mouseenter').and.callThrough();
    const mouseleaveListener = spyOn(eventHost, 'mouseleave').and.callThrough();
    const mouseoverListener = spyOn(eventHost, 'mouseover').and.callThrough();
    const mouseoutListener = spyOn(eventHost, 'mouseout').and.callThrough();
    const mousemoveListener = spyOn(eventHost, 'mousemove').and.callThrough();
    input.click();
    expect(clickedListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mousedown());
    expect(mousedownListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mouseup());
    expect(mouseupListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mouseenter());
    expect(mouseenterListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mouseleave());
    expect(mouseleaveListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mouseover());
    expect(mouseoverListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mouseout());
    expect(mouseoutListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.mousemove());
    expect(mousemoveListener).toHaveBeenCalled();
  }));

  it('should let transparently bubble touch and keyboard events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    const eventHost = hostFixture.componentInstance;
    const keydownListener = spyOn(eventHost, 'keydown').and.callThrough();
    const keyupListener = spyOn(eventHost, 'keyup').and.callThrough();
    const keypressListener = spyOn(eventHost, 'keypress').and.callThrough();
    const touchstartListener = spyOn(eventHost, 'touchstart').and.callThrough();
    const touchendListener = spyOn(eventHost, 'touchend').and.callThrough();
    const touchmoveListener = spyOn(eventHost, 'touchmove').and.callThrough();
    input.dispatchEvent(TestEvents.keydown());
    expect(keydownListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.keyup());
    expect(keyupListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.keypress());
    expect(keypressListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.touchstart());
    expect(touchstartListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.touchend());
    expect(touchendListener).toHaveBeenCalled();
    input.dispatchEvent(TestEvents.touchmove());
    expect(touchmoveListener).toHaveBeenCalled();
  }));

  it('should emit focus, blur, input and change events as usual input', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    const eventHost = hostFixture.componentInstance;
    const changeListener = spyOn(eventHost, 'change').and.callThrough();
    const inputListener = spyOn(eventHost, 'input').and.callThrough();
    const focusListener = spyOn(eventHost, 'focus').and.callThrough();
    const blurListener = spyOn(eventHost, 'blur').and.callThrough();
    input.dispatchEvent(TestEvents.change());
    expect(changeListener).toHaveBeenCalledTimes(1);
    input.dispatchEvent(TestEvents.input());
    expect(inputListener).toHaveBeenCalledTimes(1);
    input.dispatchEvent(new Event('focus'));
    expect(focusListener).toHaveBeenCalledTimes(1);
    input.dispatchEvent(new Event('blur'));
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(blurListener).toHaveBeenCalledTimes(1);
  }));
});

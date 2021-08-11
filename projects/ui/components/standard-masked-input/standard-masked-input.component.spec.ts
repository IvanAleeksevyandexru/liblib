import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { StandardMaskedInputComponent } from './standard-masked-input.component';
import { InvalidResultsTipComponent } from '../invalid-results-tip/invalid-results-tip.component';
import { QuestionHelpTipComponent } from '../question-help-tip/question-help-tip.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';
import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';
const DIGIT = /\d/;
const SYMBOL = /[a-zA-Z]/;

class CorrectInitialValue {
  private valueInternal = '(99) 34-27';
  public get value() {
    return this.valueInternal;
  }
  public set value(value: string) {
    this.valueInternal = value;
  }
}

@Component({
  template: `<lib-standard-masked-input #input [mask]="mask" [(ngModel)]="value" [commitOnInput]="false"></lib-standard-masked-input>`
})
class NgModelComponent extends CorrectInitialValue {
  @ViewChild('input', {static: true}) public input: StandardMaskedInputComponent;
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
}

@Component({
  template: `<lib-standard-masked-input #input [mask]="mask" [(ngModel)]="value" [commitOnInput]="false"></lib-standard-masked-input>`
})
class NgBrokenModelComponent {
  @ViewChild('input', {static: true}) public input: StandardMaskedInputComponent;
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
  private valueInternal = '(99) 34a-t7';
  public get value() {
    return this.valueInternal;
  }
  public set value(value: string) {
    this.valueInternal = value;
  }
}

@Component({
  template: `<lib-standard-masked-input #input [mask]="mask" [(ngModel)]="value" [commitOnInput]="false"></lib-standard-masked-input>`
})
class NgEmptyModelComponent {
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
  @ViewChild('input', {static: true}) public input: StandardMaskedInputComponent;
  public value = '';
}

@Component({
  template: `<lib-standard-masked-input #input [mask]="mask"
    [(ngModel)]="value" [showMaskAsPlaceholder]="true" [commitOnInput]="false"></lib-standard-masked-input>`
})
class MaskPlaceholderComponent {
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
  @ViewChild('input', {static: true}) public input: StandardMaskedInputComponent;
  public value = '';
}

@Component({
  template: `<div [formGroup]="form"><lib-standard-masked-input #input
    [mask]="mask" formControlName="mask" [commitOnInput]="false"></lib-standard-masked-input></div>`
})
class InitialCorrectFormTestComponent {
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
  public form = new FormGroup({mask: new FormControl('(99) 34-27')});
}

@Component({
  template: `<div [formGroup]="form"><lib-standard-masked-input #input
    [mask]="mask" formControlName="mask" [commitOnInput]="false"></lib-standard-masked-input></div>`
})
class InitialBrokenFormTestComponent {
  public mask = ['(', DIGIT, DIGIT, ')', ' ', DIGIT, DIGIT, '-', DIGIT, DIGIT];
  public form = new FormGroup({mask: new FormControl('(99) 34a-t7')});
}

@Component({
  template: `<lib-standard-masked-input #managed (focus)="otherInputFocusReceived()"
                (blur)="otherInputBlured()" contextClass="managed"></lib-standard-masked-input>
    <lib-standard-masked-input #input (focus)="focusReceived()"
                (blur)="inputBlured()" contextClass="base"></lib-standard-masked-input>
    <input type="text" #unmanaged (focus)="unmanagedInputFocusReceived()"
                (blur)="unmanagedBlured()" class="unmanaged"/>`
})
class FocusTestComponent {
  @ViewChild('managed', {static: true})
  public managed: StandardMaskedInputComponent;
  @ViewChild('unmanaged', {static: true})
  public unmanaged: HTMLInputElement;
  @ViewChild('input', {static: true})
  public input: StandardMaskedInputComponent;
  public otherInputFocusReceived() {}
  public otherInputBlured() {}
  public focusReceived() {}
  public inputBlured() {}
  public unmanagedInputFocusReceived() {}
  public unmanagedBlured() {}
}

@Component({
  template: `<lib-standard-masked-input (change)="change()" (input)="input()" (focus)="focus()" (blur)="blur()"
            (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
            (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
                (mousedown)="mousedown()" (mouseup)="mouseup()"
            (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
                (mouseout)="mouseout()" (mousemove)="mousemove()"></lib-standard-masked-input>`
})
class EventTestComponent {
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

describe('StandardMaskedInputComponent', () => {
  let component: StandardMaskedInputComponent;
  let fixture: ComponentFixture<NgModelComponent>;
  let input: HTMLInputElement;
  let ngModel: NgModelComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        StandardMaskedInputComponent, InvalidResultsTipComponent, QuestionHelpTipComponent, LibTranslatePipe, AppTranslatePipe,
        PipedMessagePipe, NgModelComponent, NgBrokenModelComponent, NgEmptyModelComponent, MaskPlaceholderComponent,
        InitialCorrectFormTestComponent, InitialBrokenFormTestComponent, FocusTestComponent, EventTestComponent
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

  it('should set correct permitted initial value from ngmodel', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(NgModelComponent);
    const setter = spyOnProperty(hostFixture.componentInstance, 'value', 'set');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.value).toBe('(99) 34-27');
    expect(hostFixture.nativeElement.querySelector('.text-input').value).toBe('(99) 34-27');
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should set correct permitted initial value from reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialCorrectFormTestComponent);
    const setter = spyOn(hostFixture.componentInstance.form.controls.mask, 'setValue').and.callThrough();
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34-27');
    expect(hostFixture.nativeElement.querySelector('.text-input').value).toBe('(99) 34-27');
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should adopt initial value from ngmodel if mask violated (without commit back)', fakeAsync(() => {
    // rest of the value starting from broken character is filtered and partially discarded
    const hostFixture = TestBed.createComponent(NgBrokenModelComponent);
    const setter = spyOnProperty(hostFixture.componentInstance, 'value', 'set');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.value).toBe('(99) 34a-t7');
    expect(hostFixture.nativeElement.querySelector('.text-input').value).toBe('(99) 34-7_');
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should adopt initial value from reactive form if mask violated', fakeAsync(() => {
    // rest of the value starting from broken character is filtered and partially discarded
    const hostFixture = TestBed.createComponent(InitialBrokenFormTestComponent);
    const setter = spyOn(hostFixture.componentInstance.form.controls.mask, 'setValue').and.callThrough();
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34a-t7');
    expect(hostFixture.nativeElement.querySelector('.text-input').value).toBe('(99) 34-7_');
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should adopt incorrect ngmodel value if incorrect for representation, protecting model', fakeAsync(() => {
    expect(fixture.componentInstance.value).toBe('(99) 34-27');
    expect(input.value).toBe('(99) 34-27');
    fixture.componentInstance.value = '(99) 34a-t7';
    const setter = spyOnProperty(fixture.componentInstance, 'value', 'set');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('(99) 34a-t7');
    expect(setter).not.toHaveBeenCalled();
    expect(input.value).toBe('(99) 34-7_');
  }));

  it('should adopt incorrect reactive form value if incorrect for representation, protecting model', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialCorrectFormTestComponent);
    input = hostFixture.nativeElement.querySelector('.text-input');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34-27');
    expect(hostFixture.nativeElement.querySelector('.text-input').value).toBe('(99) 34-27');
    hostFixture.componentInstance.form.controls.mask.setValue('(99) 34a-t7');
    const setter = spyOn(hostFixture.componentInstance.form.controls.mask, 'setValue').and.callThrough();
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34a-t7');
    expect(setter).not.toHaveBeenCalled();
    expect(input.value).toBe('(99) 34-7_');
  }));

  it('should not react when mask is changed after the value is set', fakeAsync(() => {
    expect(fixture.componentInstance.value).toBe('(99) 34-27');
    expect(input.value).toBe('(99) 34-27');
    fixture.componentInstance.input.mask = [DIGIT, DIGIT, '(', DIGIT, ')', ' ', DIGIT, DIGIT];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('(99) 34-27');
    expect(input.value).toBe('(99) 34-27');
  }));

  it('should not allow entering invalid characters', fakeAsync(() => {
    component.mask = [SYMBOL, SYMBOL, DIGIT, DIGIT];
    component.showMaskAsPlaceholder = true;
    component.removePlaceholderSymbols = false;
    component.update();
    fixture.detectChanges();
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    tick();
    expect(input.value).toBe('____');
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    tick();
    expect(input.value).toBe('____');
    TestEvents.setCaretPosition(input, 2);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    tick();
    expect(input.value).toBe('__7_');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('__7_');
  }));

  it('should be bind-in to ngmodel', fakeAsync(() => {
    expect(input.value).toBe('(99) 34-27');
    ngModel.value = '(37) 29-29';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('(37) 29-29');
  }));

  it('should be bind-out to ngmodel', () => {
    expect(input.value).toBe('(99) 34-27');
    expect(ngModel.value).toBe('(99) 34-27');
    input.value = '(99) 34-29';
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(99) 34-29');
  });

  it('should be bind-in to reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialCorrectFormTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(input.value).toBe('(99) 34-27');
    hostFixture.componentInstance.form.controls.mask.setValue('(99) 34-25');
    hostFixture.detectChanges();
    tick();
    expect(input.value).toBe('(99) 34-25');
  }));

  it('should be bind-out to reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialCorrectFormTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34-27');
    expect(input.value).toBe('(99) 34-27');
    input.value = '(99) 34-25';
    input.dispatchEvent(TestEvents.change());
    expect(hostFixture.componentInstance.form.controls.mask.value).toBe('(99) 34-25');
  }));

  it('should transparently map base attributes to the input', () => {
    component.id = 'id';
    component.name = 'name';
    component.tabIndex = '8';
    component.placeholder = 'Enter text';
    component.autocomplete = 'on';
    component.readOnly = true;
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(input.id).toBe('id');
    expect(input.name).toBe('name');
    expect(input.tabIndex).toBe(8);
    expect(input.placeholder).toBe('Enter text');
    expect(input.autocomplete).toBe('on');
    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
  });

  it('should miss most of base attributes when unset', () => {
    // getAttr is used to distinguish missing attribute (not empty, but missing)
    expect(input.getAttribute('id')).toBe(null);
    expect(input.getAttribute('name')).toBe(null);
    expect(input.getAttribute('tabIndex')).toBe(null);
    expect(input.getAttribute('placeholder')).toBe(null);
    expect(input.getAttribute('autocomplete')).toBe(null);
    expect(input.getAttribute('disabled')).toBe(null);
    expect(input.getAttribute('readOnly')).toBe(null);
  });

  it('should commit value on change if commitOnInput is not activated', () => {
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = '(35) 35-35';
    input.dispatchEvent(TestEvents.change());
    expect(setter).toHaveBeenCalled();
    input.value = '(35) 35-33';
    input.dispatchEvent(TestEvents.change());
    expect(setter).toHaveBeenCalledTimes(2);
    expect(ngModel.value).toBe('(35) 35-33');
  });

  it('should commit value on input (any change) if commitOnInput activated', fakeAsync(() => {
    component.commitOnInput = true;
    fixture.detectChanges();
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = '(34) 5';
    input.dispatchEvent(TestEvents.input());
    tick();
    expect(setter).toHaveBeenCalled();
    expect(ngModel.value).toBe('(34) 5-');
    input.value = '(34) 55';
    input.dispatchEvent(TestEvents.input());
    tick();
    expect(setter).toHaveBeenCalledTimes(2);
    expect(ngModel.value).toBe('(34) 55-');
    input.value = '(34) 55-7';
    input.dispatchEvent(TestEvents.input());
    tick();
    expect(setter).toHaveBeenCalledTimes(3);
    expect(ngModel.value).toBe('(34) 55-7');
  }));

  it('should commit corrected value on change when formatter changes value', fakeAsync(() => {
    component.formatter = (value: string) => value ? value.replace(/5/g, '6') : '';
    component.update();
    fixture.detectChanges();
    expect(ngModel.value).toBe('(99) 34-27');
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = '(99) 87-85';
    input.dispatchEvent(TestEvents.input());
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(99) 87-86');
    expect(input.value).toBe('(99) 87-86');
    expect(setter).toHaveBeenCalledTimes(1);
  }));

  it('should commit corrected value on input when formatter changes value and commitOnInput is set', fakeAsync(() => {
    component.formatter = (value: string) => value ? value.replace(/5/g, '6') : '';
    component.commitOnInput = true;
    component.update();
    fixture.detectChanges();
    expect(ngModel.value).toBe('(99) 34-27');
    const setter = spyOnProperty(ngModel, 'value', 'set').and.callThrough();
    input.value = '(99) 87-85';
    input.dispatchEvent(TestEvents.input());
    tick();
    expect(ngModel.value).toBe('(99) 87-86');
    expect(input.value).toBe('(99) 87-86');
    expect(setter).toHaveBeenCalledTimes(1);
  }));

  it('should protect placeholder chars when removePlaceholderSymbols is disabled', () => {
    component.removePlaceholderSymbols = false;
    fixture.detectChanges();
    expect(ngModel.value).toBe('(99) 34-27');
    input.value = '(99) 87-2_';
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(99) 87-2_');
  });

  it('should protect placeholder chars when removePlaceholderSymbols is disabled on commitOnInput', fakeAsync(() => {
    component.commitOnInput = true;
    component.removePlaceholderSymbols = false;
    fixture.detectChanges();
    expect(ngModel.value).toBe('(99) 34-27');
    input.value = '(99) 87-2_';
    input.dispatchEvent(TestEvents.input());
    tick();
    expect(ngModel.value).toBe('(99) 87-2_');
  }));

  it('should replace symbol in the middle when keepCharPositions is enabled', fakeAsync(() => {
    component.mask = ['(', DIGIT, DIGIT, ')', DIGIT, DIGIT, '-', DIGIT, DIGIT];
    component.keepCharPositions = true;
    component.removePlaceholderSymbols = false;
    component.update();
    ngModel.value = '(9_)34-27';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('(9_)34-27');  // symbol replaced with 7 without shift
    TestEvents.setCaretPosition(input, 2);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(97)34-27');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(97)34-27');
  }));

  it('should allow inserting symbol to the value when keepCharPositions is set to false', fakeAsync(() => {
    component.mask = ['(', DIGIT, DIGIT, ')', DIGIT, DIGIT, '-', DIGIT, DIGIT];
    component.keepCharPositions = false;
    component.removePlaceholderSymbols = false;
    component.update();
    ngModel.value = '(9_)34-27';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('(9_)34-27');  // after going text shifted
    TestEvents.setCaretPosition(input, 2);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(97)_3-42');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(97)_3-42');
  }));

  it('should move rest of symbols when deleting symbol without keepCharPositions', fakeAsync(() => {
    component.mask = ['(', DIGIT, DIGIT, ')', DIGIT, DIGIT, '-', DIGIT, DIGIT];
    component.keepCharPositions = false;
    component.removePlaceholderSymbols = false;
    component.update();
    ngModel.value = '(95)34-27';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('(95)34-27');  // after going text shifted
    TestEvents.setCaretPosition(input, 3);
    TestEvents.pressBackspace(input);
    expect(input.value).toBe('(93)42-7_');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(93)42-7_');
  }));

  it('should hold symbols positions when deleting symbol with keepCharPositions', fakeAsync(() => {
    component.mask = ['(', DIGIT, DIGIT, ')', DIGIT, DIGIT, '-', DIGIT, DIGIT];
    component.keepCharPositions = true;
    component.removePlaceholderSymbols = false;
    component.update();
    ngModel.value = '(95)34-27';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(input.value).toBe('(95)34-27');  // symbol replaced with 7 without shift
    TestEvents.setCaretPosition(input, 3);
    TestEvents.pressBackspace(input);
    expect(input.value).toBe('(9_)34-27');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(9_)34-27');
  }));

  it('should show mask as initial value (with fixed chars) when showMaskAsPlaceholder', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(MaskPlaceholderComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    component = hostFixture.componentInstance.input;
    component.showMaskAsPlaceholder = true;
    component.removePlaceholderSymbols = false;
    hostFixture.detectChanges();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(input.value).toBe('(__) __-__');
  }));

  it('should not show mask symbols as placeholder when showConstantMaskSymbols is set to false', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(NgEmptyModelComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    component = hostFixture.componentInstance.input;
    component.showMaskAsPlaceholder = false;
    component.removePlaceholderSymbols = false;
    hostFixture.detectChanges();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(input.value).toBe('');
  }));

  it('should let set custom placeholder, visible when not overrided with showMaskAsPlaceholder (as value)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(NgEmptyModelComponent);
    hostFixture.componentInstance.input.placeholder = 'Введите значение';
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(input.placeholder).toBe('Введите значение');
    expect(input.value).toBe('');
  }));

  it('should only constant symbols in entered part when showConstantMaskSymbols is disabled', fakeAsync(() => {
    ngModel.value = '';
    component.showConstantMaskSymbols = false;
    component.update();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(77) ');
  }));

  it('should show all constant symbols immediately after input when showConstantMaskSymbols activated', fakeAsync(() => {
    ngModel.value = '';
    component.showConstantMaskSymbols = true;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    TestEvents.setCaretPosition(input, 0);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(7_) __-__');
  }));

  it('should let formatter replace symbols when editing and commit them to ngmodel', fakeAsync(() => {
    component.formatter = (value) => value.replace(/7/g, '6');
    component.update();
    ngModel.value = '';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    TestEvents.setCaretPosition(input, 2);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(66) __-__');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(66) -');
  }));

  it('should prevent(reject) new symbols if they are not acceptable', fakeAsync(() => {
    component.formatter = (value) => (value.match(/7/g) || []).length > 1 ? false : value; // only one '7' is allowed
    component.update();
    ngModel.value = '';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    TestEvents.setCaretPosition(input, 1);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    TestEvents.setCaretPosition(input, 2);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    TestEvents.setCaretPosition(input, 5);
    TestEvents.pressSymbol(input, 'Digit7', '7');
    expect(input.value).toBe('(7_) __-__');
    input.dispatchEvent(TestEvents.change());
    expect(ngModel.value).toBe('(7) -');
  }));

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

  it('should show error tip unless touched or edited now', fakeAsync(() => {
    component.questionTip = 'this is a tip';
    component.validationMessages = 'error text';
    component.validation = false;
    component.update();
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
    component.update();
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
    component.validation = false;
    component.validationShowOn = 'touched_unfocused';
    component.update();
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
    component.update();
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
    component.validationShowOn = 'immediate'; // force show if any
    component.update();
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
    component.update();
    fixture.detectChanges();
    errorIcon = fixture.nativeElement.querySelector('.error-icon');
    expect(errorIcon).toBe(null);
  }));

  it('should force hiding validation results when manualOverride set to false', fakeAsync(() => {
    component.validationMessages = 'error text';
    component.validation = false;
    component.validationShowOn = 'never';  // force hide
    component.update();
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
    const hostFixture = TestBed.createComponent(InitialCorrectFormTestComponent);
    hostFixture.detectChanges();
    tick();
    input = hostFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
    expect(hostFixture.componentInstance.form.controls.mask.touched).toBeFalsy();
    TestEvents.makeTouched(input);
    expect(hostFixture.componentInstance.form.controls.mask.touched).toBeTruthy();
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

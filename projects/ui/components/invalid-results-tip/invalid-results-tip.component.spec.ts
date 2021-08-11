import { async, ComponentFixture, TestBed, fakeAsync, tick  } from '@angular/core/testing';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { Component } from '@angular/core';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { StopClickPropagationDirective } from '../../directives/stop-click-propagation/stop-click-propagation.directive';
import { InvalidResultsTipComponent } from './invalid-results-tip.component';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';

@Component({
  template: `<div (click)="clicked()"><lib-invalid-results-tip [validationMessages]="\'error\'"
    [validation]="false"></lib-invalid-results-tip></div>`
})
class TestHostComponent {
  public clicked() {
    throw new Error('should not happen');
  }
}

@Component({
  template: `<lib-invalid-results-tip [validationMessages]="\'error\'"
    [validation]="false"></lib-invalid-results-tip><div class="external" style="width: 1px; height: 1px"></div>`
})
class TestHost2Component {}

describe('InvalidResultsTipComponent', () => {
  let component: InvalidResultsTipComponent;
  let fixture: ComponentFixture<InvalidResultsTipComponent>;
  let icon: HTMLElement;
  let errorTip: HTMLElement;
  let dialogContent: HTMLElement;
  let arrow: Element;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvalidResultsTipComponent, PipedMessagePipe, LibTranslatePipe, AppTranslatePipe,
      StopClickPropagationDirective, ClickOutsideDirective, TestHostComponent, TestHost2Component ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidResultsTipComponent);
    component = fixture.componentInstance;
    icon = fixture.nativeElement.querySelector('.error-icon') as HTMLElement;
    component.validationMessages = 'validation broken';
    component.validation = false;
    component.update();
    fixture.detectChanges();
    errorTip = icon.querySelector('.validation-error-tip') as HTMLElement;
    arrow = icon.querySelector('.tail-mask') as HTMLElement;
    dialogContent = icon.querySelector('.error-content') as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(icon).toBeDefined();
  });

  it('should show icon when validation broken', () => {
    expect(icon.offsetWidth).not.toBe(0);
  });

  it('should render tip when clicked', () => {
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    expect(dialogContent.textContent).toBe('validation broken');
    component.validation = 'errorCode';
    component.update();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    expect(dialogContent.textContent).toBe('validation broken');
    component.validation = {errorCode: 'violated'} as ValidationErrors;
    component.update();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('validation broken');
  });

  it('should hide when valid', () => {
    component.validation = true;
    component.update();
    fixture.detectChanges();
    expect(icon.offsetWidth).toBe(0);
    component.validation = null;
    component.update();
    fixture.detectChanges();
    expect(icon.offsetWidth).toBe(0);
    component.validation = undefined;
    component.update();
    fixture.detectChanges();
    expect(icon.offsetWidth).toBe(0);
  });

  it('should hide when become valid', () => {
    icon.click();
    expect(icon.offsetWidth).not.toBe(0);
    component.validation = true;
    component.update();
    fixture.detectChanges();
    expect(icon.offsetWidth).toBe(0);
  });

  it('should render relevant message correspondent to error code', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'};
    component.validation = 'code1';
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error1');
    component.validation = {code2: 'violated'} as ValidationErrors;
    component.update();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    expect(dialogContent.textContent).toBe('error2');
  });

  it('should render more than one message if multiple codes violated', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'};
    component.validation = {code1: 'violated', code2: 'violated'} as ValidationErrors;
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error1error2');
  });

  it('should render single message if multiple codes violated when single message is set', () => {
    component.validationMessages = 'error';
    component.validation = {code1: 'violated', code2: 'violated'} as ValidationErrors;
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error');
  });

  it('should skip error codes not matching to error messages', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'};
    component.validation = {code1: 'violated', code3: 'violated'} as ValidationErrors;
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error1');
  });

  it('should show default error message if there is no specified code', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'};
    component.validation = {code3: 'violated', code4: 'violated'} as ValidationErrors;
    component.update();
    icon.click();
    fixture.detectChanges();
    const defaultErr = 'Значение не корректно';
    expect(dialogContent.textContent).toBe(defaultErr);
    component.validation = 'code3';
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe(defaultErr);
  });

  it('should show any available message if validation is posted as boolean', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'};
    component.validation = false;
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(['error1', 'error2'].includes(dialogContent.textContent)).toBe(true);
  });

  it('should show tip on hover for desk', () => {
    expect(icon.classList.contains('hover-controlled'));
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    // assert visible
    expect(errorTip.offsetWidth).not.toBe(0);
    expect(icon.classList.contains('hovered')).toBe(true);
    expect(icon.classList.contains('force-hide')).toBe(false);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    // assert non-visible
    expect(errorTip.offsetWidth).toBe(0);
    expect(icon.classList.contains('hovered')).toBe(false);
    expect(icon.classList.contains('force-show')).toBe(false);
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    expect(icon.classList.contains('hovered')).toBe(true);
    expect(icon.classList.contains('force-show')).toBe(false);
  });

  it('should not show tip on hover for mob', () => {
    // assert mouseenter and mouseleave events are not triggered on mob devices
    // (not sure is it possible to test, but it is an essential part of specification)
    // assert viewport == 'mob'
    expect(icon.classList.contains('hover-controlled'));
    // never hovered on mob devices
    expect(icon.classList.contains('hovered')).toBe(false);
    expect(errorTip.offsetWidth).toBe(0);
  });

  it('should stay persistent on click', () => {
    icon.dispatchEvent(TestEvents.mouseenter());
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
  });

  it('should toggle on double click and stay persistent', () => {
    icon.dispatchEvent(TestEvents.mouseenter());
    icon.click();
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).toBe(0);
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
  });

  it('should ignore hovering if showOnHover disabled', () => {
    component.showOnHover = false;
    fixture.detectChanges();
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).toBe(0);
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    expect(errorTip.offsetWidth).not.toBe(0);
  });

  it('tipDirection should define tip arrow classes', () => {
    expect(arrow.classList.contains('tail-left')).toBe(true);
    expect(errorTip.classList.contains('tail-left')).toBe(true);
    component.tipDirection = 'right';
    fixture.detectChanges();
    expect(arrow.classList.contains('tail-right')).toBe(true);
    expect(errorTip.classList.contains('tail-right')).toBe(true);
    component.tipDirection = 'top';
    fixture.detectChanges();
    expect(arrow.classList.contains('tail-top')).toBe(true);
    expect(errorTip.classList.contains('tail-top')).toBe(true);
    component.tipDirection = 'bottom';
    fixture.detectChanges();
    expect(arrow.classList.contains('tail-bottom')).toBe(true);
    expect(errorTip.classList.contains('tail-bottom')).toBe(true);
  });

  it('should change text if validation is changed', () => {
    component.validationMessages = {code1: 'error1', code2: 'error2'} as ValidationErrors;
    component.validation = 'code1';
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error1');
    component.validation = 'code2';
    component.update();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('error2');
  });

  it('should allow displaying html without encoding', () => {
    component.validationMessages = '<b>this <u>is</u> a <span>error message</span></b>';
    component.escapeHtml = false;
    component.update();
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('this is a error message');
  });

  it('should stretch vertically if text is too large', () => {
    component.validationMessages = `very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very long error`;
    icon.click();
    fixture.detectChanges();
    expect(errorTip.offsetWidth).toBeLessThan(300);
  });

  it('should emit show and hide on hover', () => {
    const showEmitListener = jasmine.createSpy();
    component.show.subscribe(showEmitListener);
    icon.dispatchEvent(TestEvents.mouseenter());
    expect(showEmitListener).toHaveBeenCalled();
    const hideEmitListener = jasmine.createSpy();
    component.hide.subscribe(hideEmitListener);
    icon.dispatchEvent(TestEvents.mouseleave());
    expect(hideEmitListener).toHaveBeenCalled();
  });

  it('should emit show and hide when shown by clicking', () => {
    const showEmitListener = jasmine.createSpy();
    const hideEmitListener = jasmine.createSpy();
    component.show.subscribe(showEmitListener);
    component.hide.subscribe(hideEmitListener);
    icon.dispatchEvent(TestEvents.mouseenter());
    expect(showEmitListener).toHaveBeenCalled();
    icon.click();
    expect(showEmitListener).toHaveBeenCalledTimes(1);
    expect(hideEmitListener).not.toHaveBeenCalled();
    icon.dispatchEvent(TestEvents.mouseleave());
    expect(hideEmitListener).not.toHaveBeenCalled();
    icon.dispatchEvent(TestEvents.mouseenter());
    icon.click();
    expect(hideEmitListener).toHaveBeenCalled();
  });

  it('should not propagate icon or tooltip clicks', () => {
    // required to prevent input element focusing when clicked
    const hostFixture = TestBed.createComponent(TestHostComponent);
    const hostComponent = hostFixture.componentInstance;
    const clicked = spyOn(hostComponent, 'clicked').and.callThrough();
    icon = hostFixture.nativeElement.querySelector('.error-icon');
    icon.click();
    hostFixture.detectChanges();
    const hostDialogContent = hostFixture.nativeElement.querySelector('.error-content');
    hostDialogContent.click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('should hide on external clicks', () => {
    const hostFixture = TestBed.createComponent(TestHost2Component);
    icon = hostFixture.nativeElement.querySelector('.error-icon');
    icon.click();
    hostFixture.detectChanges();
    errorTip = hostFixture.nativeElement.querySelector('.validation-error-tip') as HTMLElement;
    expect(errorTip.offsetWidth).not.toBe(0);
    const divElement = hostFixture.nativeElement.querySelector('.external');
    divElement.click();
    hostFixture.detectChanges();
    expect(errorTip.offsetWidth).toBe(0);
  });


});

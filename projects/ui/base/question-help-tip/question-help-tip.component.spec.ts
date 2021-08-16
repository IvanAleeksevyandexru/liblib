import { async, ComponentFixture, TestBed, fakeAsync, tick  } from '@angular/core/testing';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { Component, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { QuestionHelpTipComponent } from './question-help-tip.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { StopClickPropagationDirective } from '../../directives/stop-click-propagation/stop-click-propagation.directive';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';

@Component({
  template: '<lib-question-help-tip>some new tip</lib-question-help-tip>'
})
class TestHostComponent {}

@Component({
  template: '<div (click)="clicked()"><lib-question-help-tip>some new tip</lib-question-help-tip></div>'
})
class TestHost2Component {
  public clicked() {
    throw new Error('should not happen');
  }
}

@Component({
  template: '<lib-question-help-tip>some new tip</lib-question-help-tip><div class="external" style="width: 1px; height: 1px"></div>'
})
class TestHost3Component {
  @ViewChild('questionIcon', {static: false}) private questionIcon: ElementRef;
  @ViewChild('closeIcon', {static: false}) private closeIcon: ElementRef;
}

describe('QuestionHelpTipComponent', () => {
  let component: QuestionHelpTipComponent;
  let fixture: ComponentFixture<QuestionHelpTipComponent>;
  let element: Element;
  let icon: HTMLElement;
  let questionTip: HTMLElement;
  let dialogContent: Element;
  let arrow: Element;

  beforeEach(async(() => {
    TestBed.overrideComponent(QuestionHelpTipComponent, {
      set: new Component({
        changeDetection: ChangeDetectionStrategy.Default
      })
    });
    TestBed.configureTestingModule({
      declarations: [
        QuestionHelpTipComponent, LibTranslatePipe, AppTranslatePipe, PipedMessagePipe,
        StopClickPropagationDirective, ClickOutsideDirective, TestHostComponent, TestHost2Component, TestHost3Component ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionHelpTipComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    icon = element.querySelector('.question-icon') as HTMLElement;
    component.questionTip = 'this is a tip';
    fixture.detectChanges();
    questionTip = icon.querySelector('.question-tip') as HTMLElement;
    arrow = icon.querySelector('.tail-mask') as HTMLElement;
    dialogContent = icon.querySelector('.dialog-content');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(icon).toBeDefined();
  });

  it('should show tip on hover for desk', () => {
    expect(icon.classList.contains('hover-controlled'));
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    // assert visible
    expect(questionTip.offsetWidth).not.toBe(0);
    expect(icon.classList.contains('hovered')).toBe(true);
    expect(icon.classList.contains('force-hide')).toBe(false);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    // assert non-visible
    expect(questionTip.offsetWidth).toBe(0);
    expect(icon.classList.contains('hovered')).toBe(false);
    expect(icon.classList.contains('force-show')).toBe(false);
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
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
    expect(questionTip.offsetWidth).toBe(0);
  });

  it('should stay persistent on click', () => {
    icon.dispatchEvent(TestEvents.mouseenter());
    icon.click();
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
  });

  it('should toggle on double click and stay persistent', () => {
    icon.dispatchEvent(TestEvents.mouseenter());
    icon.click();
    icon.click();
    fixture.detectChanges();
    expect(questionTip.offsetWidth).toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).toBe(0);
    icon.click();
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
  });

  it('should ignore hovering if showOnHover disabled', () => {
    component.showOnHover = false;
    fixture.detectChanges();
    icon.dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).toBe(0);
    icon.click();
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
    icon.dispatchEvent(TestEvents.mouseleave());
    fixture.detectChanges();
    expect(questionTip.offsetWidth).not.toBe(0);
  });

  it('tipDirection should define tip arrow classes', fakeAsync(() => {
    expect(arrow.classList.contains('tail-left')).toBe(true);
    expect(questionTip.classList.contains('tail-left')).toBe(true);
    component.tipDirection = 'right';
    fixture.detectChanges();
    tick();
    expect(arrow.classList.contains('tail-right')).toBe(true);
    expect(questionTip.classList.contains('tail-right')).toBe(true);
    component.tipDirection = 'top';
    fixture.detectChanges();
    tick();
    expect(arrow.classList.contains('tail-top')).toBe(true);
    expect(questionTip.classList.contains('tail-top')).toBe(true);
    component.tipDirection = 'bottom';
    fixture.detectChanges();
    tick();
    expect(arrow.classList.contains('tail-bottom')).toBe(true);
    expect(questionTip.classList.contains('tail-bottom')).toBe(true);
  }));

  it('should change text if questionTip is changed', fakeAsync(() => {
    icon.click();
    fixture.detectChanges();
    tick();
    tick();
    expect(dialogContent.textContent).toBe('this is a tip');
    component.questionTip = 'another tip';
    fixture.detectChanges();
    tick();
    tick();
    expect(dialogContent.textContent).toBe('another tip');
  }));

  it('should allow displaying html without encoding', () => {
    component.questionTip = '<b>this <u>is</u> a <span>html</span></b>';
    component.escapeHtml = false;
    icon.click();
    fixture.detectChanges();
    expect(dialogContent.textContent).toBe('this is a html');
  });

  it('should stretch vertically if text is too large', () => {
    component.questionTip = `very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very very very very very
    very very very very very very very very very very very very very very very very long text`;
    icon.click();
    fixture.detectChanges();
    expect(questionTip.offsetWidth).toBeLessThan(300);
  });

  it('should allow render internal content as questionTip', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    icon = hostFixture.nativeElement.querySelector('.question-icon') as HTMLElement;
    icon.click();
    hostFixture.detectChanges();
    dialogContent = hostFixture.nativeElement.querySelector('.dialog-content');
    expect(dialogContent.textContent).toBe('some new tip');
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
    const hostFixture = TestBed.createComponent(TestHost2Component);
    const hostComponent = hostFixture.componentInstance;
    const clicked = spyOn(hostComponent, 'clicked').and.callThrough();
    icon = hostFixture.nativeElement.querySelector('.question-icon');
    icon.click();
    hostFixture.detectChanges();
    const hostDialogContent = hostFixture.nativeElement.querySelector('.dialog-content');
    hostDialogContent.click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('should hide on external clicks', () => {
    const hostFixture = TestBed.createComponent(TestHost3Component);
    icon = hostFixture.nativeElement.querySelector('.question-icon');
    icon.click();
    hostFixture.detectChanges();
    questionTip = hostFixture.nativeElement.querySelector('.question-tip') as HTMLElement;
    expect(questionTip.offsetWidth).not.toBe(0);
    const divElement = hostFixture.nativeElement.querySelector('.external');
    divElement.click();
    hostFixture.detectChanges();
    expect(questionTip.offsetWidth).toBe(0);
  });
});

import { ComponentFixture, async, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SimpleSelectComponent } from './simple-select.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { ListItem } from '../../models/dropdown.model';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';

const SCROLLBAR_UPDATE_TIMING = 50;

const shortList = [
  new ListItem({ id: 1, text: '1st item' }),
  new ListItem({ id: 2, text: '2nd item' }),
  new ListItem({ id: 3, text: '3rd item' })
];
const longList = [
  new ListItem({ id: 1, text: '1st item' }),
  new ListItem({ id: 2, text: '2nd item' }),
  new ListItem({ id: 3, text: '3rd item' }),
  new ListItem({ id: 4, text: '4th item' }),
  new ListItem({ id: 5, text: '5th item' }),
  new ListItem({ id: 6, text: '6th item' }),
  new ListItem({ id: 7, text: '7th item' }),
  new ListItem({ id: 8, text: '8th item' }),
  new ListItem({ id: 9, text: '9th item' }),
  new ListItem({ id: 10, text: '10th item' }),
  new ListItem({ id: 11, text: '11th item' }),
  new ListItem({ id: 12, text: '12th item' })
];

@Component({
  template: `<lib-simple-select #dropdown [list]="list" [(ngModel)]="value" (changed)="changed()"></lib-simple-select>`
})
class NgModelComponent {
  private valueInternal = shortList[0];
  public get value() {
    return this.valueInternal;
  }
  public set value(value: any) {
    this.valueInternal = value;
  }
  public list: Array<any> = shortList;
  @ViewChild('dropdown', {static: true}) public dropdown: SimpleSelectComponent;
  public changed() {}
}

@Component({
  template: `<lib-simple-select #dropdown [list]="list" [(ngModel)]="value"></lib-simple-select><div class="out">x</div>`
})
class AnotherElementContainingComponent {
  public value = shortList[0];
  public list: Array<any> = shortList;
}

@Component({
  template: `<div [formGroup]="form"><lib-simple-select #dropdown [list]="list" formControlName="dropdown"></lib-simple-select></div>`
})
class FormControlComponent {
  public list = shortList;
  public form = new FormGroup({dropdown: new FormControl(shortList[2])});
  @ViewChild('dropdown', {static: true}) public dropdown: SimpleSelectComponent;
}

@Component({
  template: `<lib-simple-select [list]="list" (focus)="focus()" (blur)="blur()"
            (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
            (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
                (mousedown)="mousedown()" (mouseup)="mouseup()"
            (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
                (mouseout)="mouseout()" (mousemove)="mousemove()"></lib-simple-select>`
})
class EventTestComponent {
  public list = shortList;
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


function waitFixture(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

function waitOpening(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick(SCROLLBAR_UPDATE_TIMING);
  fixture.detectChanges();
}

describe('SimpleSelectComponent', () => {

  let component: NgModelComponent;
  let fixture: ComponentFixture<NgModelComponent>;
  let dropdown: SimpleSelectComponent;
  let field: HTMLElement;
  let icon: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
      declarations: [
        SimpleSelectComponent, ClickOutsideDirective, LibTranslatePipe, AppTranslatePipe, NgModelComponent,
        FormControlComponent, AnotherElementContainingComponent, EventTestComponent
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
    component = fixture.componentInstance;
    waitFixture(fixture);
    dropdown = component.dropdown;
    field = fixture.nativeElement.querySelector('.simple-select-field-label');
    icon = fixture.nativeElement.querySelector('.simple-select-arrow');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should let select item', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    expect(field.textContent).toBe('1st item');
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(3);
    items[1].click();
    fixture.detectChanges();
    expect(field.textContent).toBe('2nd item');
  }));

  it('should highlight selected item in list', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    let items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[0].classList.contains('selected')).toBeTruthy();
    items[1].click();
    fixture.detectChanges();
    icon.click();
    waitOpening(fixture);
    items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[0].classList.contains('selected')).toBeFalsy();
    expect(items[1].classList.contains('selected')).toBeTruthy();
  }));

  it('should catch up initial value from ngModel', fakeAsync(() => {
    expect(field.textContent).toBe('1st item');
    icon.click();
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[0].classList.contains('selected')).toBeTruthy();
  }));

  it('should catch up initial value from reactive form', fakeAsync(() => {
    const formFixture = TestBed.createComponent(FormControlComponent);
    waitFixture(formFixture);
    const formField = formFixture.nativeElement.querySelector('.simple-select-field-label');
    const formIcon = fixture.nativeElement.querySelector('.simple-select-arrow');
    expect(formField.textContent).toBe('3rd item');
    formIcon.click();
    waitOpening(formFixture);
    const items = formFixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[2].classList.contains('selected')).toBeTruthy();
  }));

  it('should bind-in to ngModel', fakeAsync(() => {
    expect(field.textContent).toBe('1st item');
    component.value = shortList[1];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(field.textContent).toBe('2nd item');
    icon.click();
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[1].classList.contains('selected')).toBeTruthy();
  }));

  it('should bind-out to ngModel', fakeAsync(() => {
    expect(field.textContent).toBe('1st item');
    waitOpening(fixture);
    const setter = spyOnProperty(component, 'value', 'set').and.callThrough();
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(3);
    items[1].click();
    fixture.detectChanges();
    expect(field.textContent).toBe('2nd item');
    expect(setter).toHaveBeenCalled();
    expect(component.value.id).toBe(2);
  }));

  it('should bind-in to reactive form', fakeAsync(() => {
    const formFixture = TestBed.createComponent(FormControlComponent);
    waitFixture(formFixture);
    const formField = formFixture.nativeElement.querySelector('.simple-select-field-label');
    const formIcon = formFixture.nativeElement.querySelector('.simple-select-arrow');
    expect(formField.textContent).toBe('3rd item');
    formFixture.componentInstance.form.controls.dropdown.setValue(shortList[1]);
    formFixture.detectChanges();
    tick();
    formFixture.detectChanges();
    expect(formField.textContent).toBe('2nd item');
    formIcon.click();
    waitOpening(formFixture);
    const items = formFixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items[1].classList.contains('selected')).toBeTruthy();
  }));

  it('should bind-out to reactive form', fakeAsync(() => {
    const formFixture = TestBed.createComponent(FormControlComponent);
    waitFixture(formFixture);
    const formField = formFixture.nativeElement.querySelector('.simple-select-field-label');
    const formIcon = formFixture.nativeElement.querySelector('.simple-select-arrow');
    const formSetter = spyOn(formFixture.componentInstance.form.controls.dropdown, 'setValue').and.callThrough();
    expect(formField.textContent).toBe('3rd item');
    formIcon.click();
    waitOpening(formFixture);
    const items = formFixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(3);
    items[1].click();
    formFixture.detectChanges();
    expect(formField.textContent).toBe('2nd item');
    expect(formSetter).toHaveBeenCalled();
    expect(formFixture.componentInstance.form.controls.dropdown.value.id).toBe(2);
  }));

  it('should trigger changed event when item selected', fakeAsync(() => {
    const changed = spyOn(component, 'changed').and.callThrough();
    expect(field.textContent).toBe('1st item');
    icon.click();
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    items[1].click();
    fixture.detectChanges();
    expect(field.textContent).toBe('2nd item');
    expect(component.value.id).toBe(2);
    expect(changed).toHaveBeenCalledTimes(1);
  }));

  it('should open by field clicking', fakeAsync(() => {
    field.click();
    waitOpening(fixture);
    const list = fixture.nativeElement.querySelector('.simple-select-list');
    expect(list.offsetWidth).not.toBe(0);
    expect(list.classList.contains('expanded')).toBeTruthy();
  }));

  it('should open by icon clicking', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    const list = fixture.nativeElement.querySelector('.simple-select-list');
    expect(list.offsetWidth).not.toBe(0);
    expect(list.classList.contains('expanded')).toBeTruthy();
  }));

  it('should close by field clicking when opened', fakeAsync(() => {
    field.click();
    waitOpening(fixture);
    field.click();
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('.simple-select-list');
    expect(list.offsetWidth).toBe(0);
    expect(list.classList.contains('expanded')).toBeFalsy();
    expect(list.classList.contains('collapsed')).toBeTruthy();
    expect(field.textContent).toBe('1st item');
  }));

  it('should close by icon clicking when opened', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    icon.click();
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('.simple-select-list');
    expect(list.offsetWidth).toBe(0);
    expect(list.classList.contains('expanded')).toBeFalsy();
    expect(list.classList.contains('collapsed')).toBeTruthy();
    expect(field.textContent).toBe('1st item');
  }));

  it('should not close on anywhere outside clicking', fakeAsync(() => {
    const divFixture = TestBed.createComponent(AnotherElementContainingComponent);
    waitFixture(divFixture);
    const selectIcon = divFixture.nativeElement.querySelector('.simple-select-arrow');
    selectIcon.click();
    waitOpening(divFixture);
    expect(divFixture.nativeElement.querySelector('.simple-select-list').offsetWidth).not.toBe(0);
    divFixture.nativeElement.querySelector('.out').click();
    divFixture.detectChanges();
    expect(divFixture.nativeElement.querySelector('.simple-select-list').offsetWidth).not.toBe(0);
    expect(divFixture.nativeElement.querySelector('.simple-select-field-label').textContent).toBe('1st item');
  }));

  it('should refresh items when list changed', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    let items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(3);
    component.list = longList;
    fixture.detectChanges();
    items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(12);
  }));

  it('should escape html', fakeAsync(() => {
    component.list = [{id: 1, text: '<span>item</span>'}];
    component.value = component.list[0];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(field.textContent).toBe('<span>item</span>');
    icon.click();
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.select-item.selected');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('<span>item</span>');
  }));

  it('should not fix (commit back) item when it becomes inconsistent', fakeAsync(() => {
    const setter = spyOnProperty(component, 'value', 'set');
    component.list = [{id: 4, text: 'non existing item'}];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(field.textContent).toBe('1st item');
    expect(setter).not.toHaveBeenCalled();
    expect(component.value.id).toBe(1);
    icon.click();
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    expect(items.length).toBe(1);
    expect(items[0].classList.contains('selected')).toBeFalsy();
  }));

  it('should not open when disabled', fakeAsync(() => {
    const formFixture = TestBed.createComponent(FormControlComponent);
    waitFixture(formFixture);
    const formField = formFixture.nativeElement.querySelector('.simple-select-field-label');
    const formIcon = formFixture.nativeElement.querySelector('.simple-select-arrow');
    formFixture.componentInstance.form.controls.dropdown.disable();
    waitFixture(formFixture);
    formIcon.click();
    formFixture.detectChanges();
    expect(formFixture.nativeElement.querySelector('.simple-select-items').offsetWidth).toBe(0);
    formField.click();
    formFixture.detectChanges();
    expect(formFixture.nativeElement.querySelector('.simple-select-items').offsetWidth).toBe(0);
  }));

  it('should not show scrollbar when list is short', fakeAsync(() => {
    icon.click();
    waitOpening(fixture);
    const scrollArea = fixture.nativeElement.querySelector('.simple-select-list .ps');
    expect(scrollArea.classList.contains('ps--active-y')).toBeFalsy();
    const rail = fixture.nativeElement.querySelector('.simple-select-list .ps__rail-y');
    expect(rail.offsetWidth === 0 && rail.offsetHeight === 0).toBeTruthy();
  }));

  it('should show scrollbar when list is long', fakeAsync(() => {
    component.list = longList;
    fixture.detectChanges();
    icon.click();
    waitOpening(fixture);
    const scrollArea = fixture.nativeElement.querySelector('.simple-select-list .ps');
    expect(scrollArea.classList.contains('ps--active-y')).toBeTruthy();
    const rail = fixture.nativeElement.querySelector('.simple-select-list .ps__rail-y');
    expect(rail.offsetWidth !== 0 && rail.offsetHeight !== 0).toBeTruthy();
  }));

  it('should not reset scroll position when closed and opened again', fakeAsync(() => {
    component.list = longList;
    fixture.detectChanges();
    icon.click();
    waitOpening(fixture);
    let scrollArea = fixture.nativeElement.querySelector('.simple-select-list .ps');
    const items = fixture.nativeElement.querySelectorAll('.select-item:not(.select-field-stub)');
    scrollArea.scrollTop = 100;
    icon.click();
    fixture.detectChanges();
    icon.click();
    waitOpening(fixture);
    scrollArea = fixture.nativeElement.querySelector('.simple-select-list .ps');
    expect(scrollArea.scrollTop).toBe(100);
  }));

  it('should mark as touched when first opened', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    waitFixture(hostFixture);
    expect(hostFixture.componentInstance.form.controls.dropdown.touched).toBeFalsy();
    hostFixture.nativeElement.querySelector('.simple-select-arrow').click();
    waitOpening(hostFixture);
    expect(hostFixture.componentInstance.form.controls.dropdown.touched).toBeTruthy();
  }));

  it('should let transparently pass mouse events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    waitFixture(hostFixture);
    field = hostFixture.nativeElement.querySelector('.simple-select-field') as HTMLElement;
    const eventHost = hostFixture.componentInstance;
    const clickedListener = spyOn(eventHost, 'click').and.callThrough();
    const mousedownListener = spyOn(eventHost, 'mousedown').and.callThrough();
    const mouseupListener = spyOn(eventHost, 'mouseup').and.callThrough();
    const mouseenterListener = spyOn(eventHost, 'mouseenter').and.callThrough();
    const mouseleaveListener = spyOn(eventHost, 'mouseleave').and.callThrough();
    const mouseoverListener = spyOn(eventHost, 'mouseover').and.callThrough();
    const mouseoutListener = spyOn(eventHost, 'mouseout').and.callThrough();
    const mousemoveListener = spyOn(eventHost, 'mousemove').and.callThrough();
    field.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(clickedListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mousedown());
    expect(mousedownListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mouseup());
    expect(mouseupListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mouseenter());
    expect(mouseenterListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mouseleave());
    expect(mouseleaveListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mouseover());
    expect(mouseoverListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mouseout());
    expect(mouseoutListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.mousemove());
    expect(mousemoveListener).toHaveBeenCalled();
  }));

  it('should let transparently pass touch and keyboard events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    waitFixture(hostFixture);
    field = hostFixture.nativeElement.querySelector('.simple-select-field') as HTMLElement;
    const eventHost = hostFixture.componentInstance;
    const keydownListener = spyOn(eventHost, 'keydown').and.callThrough();
    const keyupListener = spyOn(eventHost, 'keyup').and.callThrough();
    const keypressListener = spyOn(eventHost, 'keypress').and.callThrough();
    const touchstartListener = spyOn(eventHost, 'touchstart').and.callThrough();
    const touchendListener = spyOn(eventHost, 'touchend').and.callThrough();
    const touchmoveListener = spyOn(eventHost, 'touchmove').and.callThrough();
    field.dispatchEvent(TestEvents.keydown());
    expect(keydownListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.keyup());
    expect(keyupListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.keypress());
    expect(keypressListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.touchstart());
    expect(touchstartListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.touchend());
    expect(touchendListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.touchmove());
    expect(touchmoveListener).toHaveBeenCalled();
  }));

});

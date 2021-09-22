import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MockComponent } from '../../mocks/mock.component';
import { DropdownComponent } from './dropdown.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { ListItem, ListItemConverter } from '../../models/dropdown.model';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { TestHelper } from '../../mocks/test.helper';
import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateServiceStub, LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';

const EMPTY = '—';
const SCROLLBAR_UPDATE_TIMING = 50;
const shortList = [{id: 1, text: '1'}, {id: 2, text: '2'}, {id: 3, text: '3'}];
const longList = [{id: 1, text: '1'}, {id: 2, text: '2'}, {id: 3, text: '3'}, {id: 4, text: '4'}, {id: 5, text: '5'},
  {id: 6, text: '6'}, {id: 7, text: '7'}, {id: 8, text: '8'}, {id: 9, text: '9'}, {id: 10, text: '10'},
  {id: 11, text: '11'}, {id: 12, text: '12'}, {id: 13, text: '13'}, {id: 14, text: '14'}, {id: 15, text: '15'},
  {id: 16, text: '16'}, {id: 17, text: '17'}, {id: 18, text: '18'}, {id: 19, text: '19'}, {id: 20, text: '20'}];
const overflowList = [{id: 1, text: 'aaaaaaaaaaaa aaaaaaaaaaaa aaaaaaaaaaaa'},
                      {id: 2, text: 'bbbbbbbbbbbb bbbbbbbbbbbb bbbbbbbbbbbb'},
                      {id: 3, text: 'cccccccccccc cccccccccccc cccccccccccc'},
                      {id: 4, text: 'dddddddddddd dddddddddddd dddddddddddd'},
                      {id: 5, text: 'eeeeeeeeeeee eeeeeeeeeeee eeeeeeeeeeee'},
                      {id: 6, text: 'ffffffffffff ffffffffffff ffffffffffff'},
                      {id: 7, text: 'gggggggggggg gggggggggggg gggggggggggg'},
                      {id: 8, text: 'hhhhhhhhhhhh hhhhhhhhhhhh hhhhhhhhhhhh'},
                      {id: 9, text: 'mmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmm'},
                      {id: 10, text: 'wwwwwwwwwwww wwwwwwwwwwww wwwwwwwwwwww'}];

@Component({
  template: `<lib-dropdown #dropdown [items]="list" [(ngModel)]="value" (changed)="onChange()"></lib-dropdown>`
})
class NgModelComponent {
  private valueInternal = shortList[1];
  public get value() {
    return this.valueInternal;
  }
  public set value(value: any) {
    this.valueInternal = value;
  }
  public list: Array<any> = shortList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
  public onChange() {}
}

@Component({
  template: `<lib-dropdown #dropdown [items]="list" [(ngModel)]="value" [multi]="true"></lib-dropdown>`
})
class InitialValueMultiComponent {
  private valueInternal = [shortList[1], shortList[2]];
  public get value() {
    return this.valueInternal;
  }
  public set value(value: any) {
    this.valueInternal = value;
  }
  public list = shortList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<div [formGroup]="form"><lib-dropdown #dropdown [items]="list" formControlName="dropdown"></lib-dropdown></div>`
})
class FormControlComponent {
  public list = shortList;
  public form = new FormGroup({dropdown: new FormControl(shortList[2])});
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<div [formGroup]="form"><lib-dropdown #dropdown [multi]="true" [items]="list" formControlName="dropdown"></lib-dropdown></div>`
})
class FormControlMultiValueComponent {
  public list = shortList;
  public form = new FormGroup({dropdown: new FormControl([shortList[0], shortList[2]])});
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<lib-dropdown #dropdown [items]="list" [(ngModel)]="value"></lib-dropdown>`
})
class InvalidModelComponent {
  private valueInternal = {id: 4, text: '4'};
  public get value() {
    return this.valueInternal;
  }
  public set value(value: any) {
    this.valueInternal = value;
  }
  public list = shortList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<lib-dropdown #dropdown [items]="list" [(ngModel)]="value"></lib-dropdown>`
})
class LongListComponent {
  public value = longList[5];
  public list: Array<any> = longList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<lib-dropdown #dropdown [multi]="true" [items]="list" [(ngModel)]="value"></lib-dropdown>`
})
class LongListMultiComponent {
  public value = [longList[9], longList[15]];
  public list: Array<any> = longList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<lib-dropdown #dropdown [multi]="true" [items]="list" [(ngModel)]="value"></lib-dropdown>`
})
class OverflowTestComponent {
  public value = [overflowList[1], overflowList[3], overflowList[4], overflowList[6], overflowList[8], overflowList[9]];
  public list: Array<any> = overflowList;
  @ViewChild('dropdown', {static: true}) public dropdown: DropdownComponent;
}

@Component({
  template: `<lib-dropdown #managed [items]="list" (focus)="otherDropdownFocusReceived()"
                (blur)="otherDropdownBlured()" contextClass="managed"></lib-dropdown>
    <lib-dropdown #dropdown [items]="list" (focus)="focusReceived()"
                (blur)="dropdownBlured()" contextClass="base"></lib-dropdown>
    <input type="text" #unmanaged (focus)="unmanagedFocusReceived()"
                (blur)="unmanagedBlured()" class="unmanaged"/>`
})
class FocusTestComponent {
  public list = shortList;
  @ViewChild('managed', {static: true})
  public managed: DropdownComponent;
  @ViewChild('unmanaged', {static: true})
  public unmanaged: HTMLInputElement;
  @ViewChild('dropdown', {static: true})
  public dropdown: DropdownComponent;
  public otherDropdownFocusReceived() {}
  public otherDropdownBlured() {}
  public focusReceived() {}
  public dropdownBlured() {}
  public unmanagedFocusReceived() {}
  public unmanagedBlured() {}
}

@Component({
  template: `<lib-dropdown [items]="list" (focus)="focus()" (blur)="blur()"
            (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
            (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
                (mousedown)="mousedown()" (mouseup)="mouseup()"
            (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
                (mouseout)="mouseout()" (mousemove)="mousemove()"></lib-dropdown>`
})
class EventTestComponent {
  public list = shortList;
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

describe('DropdownComponent', () => {

  let component: NgModelComponent;
  let fixture: ComponentFixture<NgModelComponent>;
  let dropdown: DropdownComponent;
  let field: HTMLElement;
  let focusInput: HTMLInputElement;
  let setter: jasmine.Spy<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
      declarations: [
        DropdownComponent, ClickOutsideDirective, NgModelComponent, InitialValueMultiComponent,
        FormControlComponent, FormControlMultiValueComponent, InvalidModelComponent,
        FocusTestComponent, LongListComponent, LongListMultiComponent, OverflowTestComponent, EventTestComponent,
        LibTranslatePipe, AppTranslatePipe
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
    dropdown = component.dropdown;
    field = fixture.nativeElement.querySelector('.dropdown-field');
    focusInput = fixture.nativeElement.querySelector('.focusable-input');
    setter = spyOnProperty(component, 'value', 'set').and.callThrough();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pick up initial model from ngModel', () => {
    expect(component.value.id).toBe(2);
    expect(dropdown.internalSelected[0].id).toBe(2);
    expect(setter).not.toHaveBeenCalled();
    expect(field.textContent).toBe('2');
  });

  it('should pick up initial multi model from ngModel', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    const componentField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(componentInstance.value.length).toBe(2);
    expect(componentInstance.dropdown.internalSelected.length).toBe(2);
    expect(componentInstance.dropdown.internalSelected[0].id).toBe(2);
    expect(componentInstance.dropdown.internalSelected[1].id).toBe(3);
    expect(componentSetter).not.toHaveBeenCalled();
    expect(componentField.textContent).toBe('23');
  }));

  it('should pick up initial model value as reactive form control', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOn(componentInstance.form.controls.dropdown, 'setValue').and.callThrough();
    const componentField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    expect(componentInstance.form.controls.dropdown.value.id).toBe(3);
    expect(componentInstance.dropdown.internalSelected[0].id).toBe(3);
    expect(componentSetter).not.toHaveBeenCalled();
    expect(componentField.textContent).toBe('3');
  }));

  it('should highlight selected item when opened', () => {
    dropdown.returnFocus();
    const selectedItem = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(selectedItem.length).toBe(1);
    expect(selectedItem[0].textContent).toBe('2');
  });

  it('should consider items equal if their ids are equal', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    component.value = {id: 3, text: '3'}; // cloned object
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const selectedItem = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(selectedItem.length).toBe(1);
    expect(selectedItem[0].textContent).toBe('3');
    expect(field.textContent).toBe('3');
  }));

  it('should highlight multi-selection in multi mode', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    const componentField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const selectedItems = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(selectedItems.length).toBe(2);
    expect(selectedItems[0].textContent).toBe('2');
    expect(selectedItems[1].textContent).toBe('3');
    expect(componentField.textContent.includes('2')).toBeTruthy();
    expect(componentField.textContent.includes('3')).toBeTruthy();
    expect(componentSetter).not.toHaveBeenCalled();
  }));

  it('should let deselect items in multiple mode', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    const componentField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[1].click();
    items[2].click();
    tick();
    hostFixture.detectChanges();
    expect(componentSetter).toHaveBeenCalled();
    expect(componentField.textContent).toBe(EMPTY);
    expect(componentInstance.value.length).toBe(0);
    expect(hostFixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).not.toBe(0);
  }));

  it('should neither highlight as selected item nor commit back(fix) when initial item is inconsistent', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InvalidModelComponent);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    const componentField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const selectedItems = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(selectedItems.length).toBe(0);
    expect(componentField.textContent).toBe(EMPTY);
    expect(componentSetter).not.toHaveBeenCalled();
  }));

  it('should consume array of acceptable items to select values from', () => {
    component.list = [{id: 10, text: '10'}, {id: 11, text: '11'}];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('10');
    expect(items[1].textContent).toBe('11');
  });

  it('should let consume inapropriate items using input converter', () => {
    dropdown.converter = new ListItemConverter(
      (x: any) => new ListItem({id: x.itemNumber, text: x.value}, x),
      (x: ListItem) => x.originalItem
    );
    component.list = [{itemNumber: 7, value: '7'}, {itemNumber: 12, value: '12'}];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('7');
    expect(items[1].textContent).toBe('12');
  });

  it('should preserve list items order (not sorting or reordering items)', () => {
    component.list = [{id: 2, text: 'b'}, {id: 1, text: 'a'}];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('b');
    expect(items[1].textContent).toBe('a');
  });

  it('should synchronously change available for selection items when array changes', () => {
    component.list = [{id: 1, text: 'a'}, {id: 2, text: 'b'}];
    fixture.detectChanges();
    component.list = [{id: 3, text: 'c'}, {id: 4, text: 'd'}];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('c');
    expect(items[1].textContent).toBe('d');
  });

  it('should bind-in to model when used with ngModel', fakeAsync(() => {
    let items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(field.textContent).toBe('2');
    expect(items[0].textContent).toBe('2');
    component.value = shortList[2];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    items = fixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(field.textContent).toBe('3');
    expect(items[0].textContent).toBe('3');
  }));

  it('should bind-in to model when used with ngModel (multi)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    hostFixture.componentInstance.value = [shortList[0], shortList[2]];
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(hostField.textContent).toBe('13');
    expect(items.length).toBe(2);
  }));

  it('should bind-in to form when used with reactive forms', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    let items = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(hostField.textContent).toBe('3');
    expect(items[0].textContent).toBe('3');
    hostFixture.componentInstance.form.controls.dropdown.setValue(shortList[0]);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    items = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(hostField.textContent).toBe('1');
    expect(items[0].textContent).toBe('1');
  }));

  it('should bind-in to form when used with reactive forms (multi)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlMultiValueComponent);
    hostFixture.detectChanges();
    tick();
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    let items = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(hostField.textContent).toBe('13');
    expect(items.length).toBe(2);
    hostFixture.componentInstance.form.controls.dropdown.setValue([shortList[0], shortList[1]]);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    items = hostFixture.nativeElement.querySelectorAll('.dropdown-list-container .dropdown-item.selected');
    expect(hostField.textContent).toBe('12');
    expect(items.length).toBe(2);
  }));

  it('should bind-out to model when used with ngModel', () => {
    dropdown.returnFocus();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[items.length - 1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').classList.contains('hidden')).toBe(true);
    expect(component.value.id).toBe(3);
  });

  it('should bind-out to model when used with ngModel (multi)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    hostFixture.detectChanges();
    tick();
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    dropdown = componentInstance.dropdown;
    dropdown.returnFocus();
    tick(50);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();  // adds 1th el to current selection
    tick();
    hostFixture.detectChanges();
    expect(hostField.textContent.includes('1')).toBeTruthy();
    expect(hostField.textContent.includes('2')).toBeTruthy();
    expect(hostField.textContent.includes('3')).toBeTruthy();
    expect(componentSetter).toHaveBeenCalled();
    expect(componentInstance.value.length).toBe(3);
    expect(componentInstance.value.includes(shortList[0])).toBeTruthy();
    expect(componentInstance.value.includes(shortList[1])).toBeTruthy();
    expect(componentInstance.value.includes(shortList[2])).toBeTruthy();
  }));

  it('should bind-out to form when used with reactive forms', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOn(componentInstance.form.controls.dropdown, 'setValue').and.callThrough();
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    dropdown = componentInstance.dropdown;
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    hostFixture.detectChanges();
    expect(hostField.textContent).toBe('1');
    expect(componentSetter).toHaveBeenCalled();
    expect(componentInstance.form.controls.dropdown.value === shortList[0]).toBeTruthy();
    expect(hostFixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).toBe(0);
  }));

  it('should bind-out to form when used with reactive forms (multi)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlMultiValueComponent);
    hostFixture.detectChanges();
    tick();
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOn(componentInstance.form.controls.dropdown, 'setValue').and.callThrough();
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    dropdown = componentInstance.dropdown;
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[1].click();  // adds 2nd el to current selection
    tick();
    hostFixture.detectChanges();
    expect(hostField.textContent.includes('1')).toBeTruthy();
    expect(hostField.textContent.includes('2')).toBeTruthy();
    expect(hostField.textContent.includes('3')).toBeTruthy();
    expect(componentSetter).toHaveBeenCalled();
    expect(componentInstance.form.controls.dropdown.value.length).toBe(3);
    expect(componentInstance.form.controls.dropdown.value.includes(shortList[0])).toBeTruthy();
    expect(componentInstance.form.controls.dropdown.value.includes(shortList[1])).toBeTruthy();
    expect(componentInstance.form.controls.dropdown.value.includes(shortList[2])).toBeTruthy();
  }));

  it('should output original items (not synthetic or cloned) in single mode', () => {
    dropdown.returnFocus();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[items.length - 1].click();
    fixture.detectChanges();
    expect(component.value === shortList[2]).toBeTruthy(); // equal by ===
  });

  it('should output initial items (not synthetic or cloned) in multi mode', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    hostFixture.detectChanges();
    tick();
    dropdown = hostFixture.componentInstance.dropdown;
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    items[1].click(); // inverts initial 1, 2 selection to 0, 2
    tick();
    fixture.detectChanges();
    const componentInstance = hostFixture.componentInstance;
    expect(componentInstance.value.length).toBe(2);
    expect(componentInstance.value.includes(shortList[0])).toBeTruthy();
    expect(componentInstance.value.includes(shortList[2])).toBeTruthy();
    // includes compares items by default with ===, order should not be predicted
  }));

  it('should store originalItem (not synthetic) in originalItem even if passed through converter', fakeAsync(() => {
    dropdown.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => x.originalItem
    );
    component.list = [shortList[0], shortList[1], shortList[2]]; // clone to force convertion
    fixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[items.length - 1].click();
    fixture.detectChanges();
    expect(component.value === shortList[2]).toBeTruthy();
  }));

  it('should output converted via converter (possibly synthetic) when converter is provided', () => {
    dropdown.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => ({id: x.id, text: x.text})
    );
    component.list = [shortList[0], shortList[1], shortList[2]]; // clone to force convertion
    fixture.detectChanges();
    dropdown.returnFocus();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[items.length - 1].click();
    fixture.detectChanges();
    expect(component.value === shortList[2]).toBeFalsy();
    expect(component.value.id === shortList[2].id).toBeTruthy();
  });

  it('should output converted via converter (possibly synthetic) multiple items when converter provided', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const componentInstance = hostFixture.componentInstance;
    dropdown = componentInstance.dropdown;
    dropdown.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => ({id: x.id, text: x.text})
    );
    componentInstance.list = [shortList[0], shortList[1], shortList[2]]; // clone initials to force convertion
    componentInstance.value = [shortList[0], shortList[2]];
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    items[1].click(); // inverts initial 0, 2 selection to 1, 2
    tick();
    fixture.detectChanges();
    expect(componentInstance.value.length).toBe(2);
    expect(componentInstance.value.includes(shortList[1])).toBeFalsy();
    expect(componentInstance.value.includes(shortList[2])).toBeFalsy();
    expect(componentInstance.value.map((x) => x.id).includes(shortList[1].id)).toBeTruthy();
    expect(componentInstance.value.map((x) => x.id).includes(shortList[2].id)).toBeTruthy();
  }));

  it('should allow hidden elements (available for programmatic choise), but not show them in list', () => {
    component.list = [shortList[0], {id: 4, text: '4', hidden: true} as any, shortList[1], shortList[2]];
    component.value = shortList[1];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    const invisible = fixture.nativeElement.querySelectorAll('.dropdown-item.hidden');
    const selected = fixture.nativeElement.querySelectorAll('.dropdown-item.selected');
    expect(items.length).toBe(4);
    expect(invisible.length).toBe(1);
    expect(selected[0].textContent).toBe('2');
  });

  it('should allow hidden element to be selected programmatically', fakeAsync(() => {
    const invisibleEl = {id: 4, text: '4', hidden: true} as any;
    component.list = [shortList[0], invisibleEl, shortList[1], shortList[2]];
    component.value = invisibleEl;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(field.textContent).toBe('4');
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    const invisible = fixture.nativeElement.querySelectorAll('.dropdown-item.hidden');
    const selected = fixture.nativeElement.querySelectorAll('.dropdown-item.selected');
    expect(items.length).toBe(4);
    expect(invisible.length).toBe(1);
    expect(selected[0].textContent).toBe('4');
  }));

  it('should preserve consistent selection item when list changes', () => {
    component.list = [{id: 4, text: '4'}, shortList[1], {id: 5, text: '5'}];
    fixture.detectChanges();
    expect(component.value === shortList[1]).toBeTruthy();
    expect(setter).not.toHaveBeenCalled();
    dropdown.returnFocus();
    const selected = fixture.nativeElement.querySelectorAll('.dropdown-item.selected');
    expect(selected[0].textContent).toBe('2');
    expect(field.textContent).toBe('2');
  });

  it('should preserve consistent selection not strictly equals as objects', () => {
    component.list = [{id: 4, text: '4'}, {id: 2, text: '2'}, {id: 5, text: '5'}];
    fixture.detectChanges();
    expect(component.value.id === 2).toBeTruthy();
    expect(setter).not.toHaveBeenCalled();
    dropdown.returnFocus();
    const selected = fixture.nativeElement.querySelectorAll('.dropdown-item.selected');
    expect(selected[0].textContent).toBe('2');
    expect(field.textContent).toBe('2');
  });

  it('should preserve consistent part of multi-selection when list changes', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    const componentInstance = hostFixture.componentInstance;
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-values');
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    dropdown = componentInstance.dropdown;
    componentInstance.list = [{id: 4, text: '4'}, shortList[2], {id: 5, text: '5'}];
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(componentSetter).not.toHaveBeenCalled();
    expect(hostField.textContent).toBe('3');
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item.selected');
    expect(items[0].textContent).toBe('3');
  }));

  it('should open dropdown when receiving focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
  }));

  it('should open dropdown when icon clicked when unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const icon = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    expect(document.activeElement).not.toBe(focusInput);
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
  }));

  it('should open dropdown when icon clicked when focused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    input.click();  // hide initially shown by focus dropdown
    hostFixture.detectChanges();
    const icon = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    TestEvents.blur(input);
    icon.click();  // click when we initially focused and hidden
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
  }));

  it('should open dropdown when inpup clicked when focused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    input.click();  // hide initially shown by focus dropdown, staying focused
    hostFixture.detectChanges();
    input.click();  // click when we initially focused and hidden
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
  }));

  it('should open dropdown when input clicked when unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input); // click+focus
    input.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
  }));

  it('should hide dropdown on repeated click on input', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    input.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    input.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).toBe(0);
  }));

  it('should hide dropdown on repeated click on icon', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const icon = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    TestEvents.blur(input);
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).toBe(0);
  }));

  it('should hide dropdown when item is clicked and selected in single-mode', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const icon = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
    const itemEl = hostFixture.nativeElement.querySelector('.base .dropdown-item');
    itemEl.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(dropdownEl.offsetWidth).toBe(0);
  }));

  it('should hide opened dropdown on blur', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
    const anotherInput: HTMLInputElement = hostFixture.nativeElement.querySelector('.unmanaged');
    TestEvents.focus(anotherInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(dropdownEl.offsetWidth).toBe(0);
  }));

  it('should close dropdown when outer control clicked', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    TestEvents.focus(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.base .dropdown-list-container');
    expect(dropdownEl.offsetWidth).not.toBe(0);
    const anotherInput: HTMLInputElement = hostFixture.nativeElement.querySelector('.unmanaged');
    anotherInput.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(dropdownEl.offsetWidth).toBe(0);
  }));

  it('should let select item when dropdown opened programmatically via openDropdown call', fakeAsync(() => {
    dropdown.openDropdown();
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    let dropdownPart = fixture.nativeElement.querySelector('.dropdown-list-container');
    expect(dropdownPart.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.focusable-input')).toBe(document.activeElement);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    dropdownPart = fixture.nativeElement.querySelector('.dropdown-list-container');
    expect(dropdownPart.offsetWidth).toBe(0);
    expect(component.value.id).toBe(1);
  }));

  it('should let select items when dropdown opened programmatically via openDropdown call', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    dropdown = hostFixture.componentInstance.dropdown;
    dropdown.openDropdown();
    hostFixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    let dropdownPart = hostFixture.nativeElement.querySelector('.dropdown-list-container');
    expect(dropdownPart.offsetWidth).not.toBe(0);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.querySelector('.focusable-input')).toBe(document.activeElement);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    dropdownPart = hostFixture.nativeElement.querySelector('.dropdown-list-container');
    expect(dropdownPart.offsetWidth).not.toBe(0);
    expect(hostFixture.componentInstance.value.length).toBe(3);
  }));

  it('should stay focused when icon clicked', fakeAsync(() => {
    expect(document.activeElement).not.toBe(focusInput);
    const icon = fixture.nativeElement.querySelector('.dropdown-arrow');
    TestEvents.blur(focusInput);
    icon.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(document.activeElement).toBe(focusInput);
  }));

  it('should stay focused when item selected', fakeAsync(() => {
    expect(document.activeElement).not.toBe(focusInput);
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.blur(focusInput);
    items[0].click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(document.activeElement).toBe(focusInput);
  }));

  it('should stay focused when item selected without dropdown closing', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const focusableInput = hostFixture.nativeElement.querySelector('.focusable-input');
    expect(document.activeElement).not.toBe(focusInput);
    const hostDropdown = hostFixture.componentInstance.dropdown;
    hostDropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = hostFixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.blur(focusInput);
    items[0].click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).not.toBe(0);
    expect(document.activeElement).toBe(focusableInput);
  }));

  it('should emit single focus event and no blur when input clicked', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    const focusSpy = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurSpy = spyOn(hostFixture.componentInstance, 'dropdownBlured').and.callThrough();
    TestEvents.focus(input);
    input.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    input.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(blurSpy).not.toHaveBeenCalled();
  }));

  it('should emit single focus event and no blur when icon clicked', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    const icon: HTMLElement = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    const focusSpy = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurSpy = spyOn(hostFixture.componentInstance, 'dropdownBlured').and.callThrough();
    TestEvents.blur(input);
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    TestEvents.blur(input);
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(blurSpy).not.toHaveBeenCalled();
  }));

  it('should emit single blur after any actions inside control and further leaving', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const blurListener = spyOn(hostFixture.componentInstance, 'dropdownBlured').and.callThrough();
    const input: HTMLInputElement = hostFixture.nativeElement.querySelector('.base .focusable-input');
    const icon: HTMLElement = hostFixture.nativeElement.querySelector('.base .dropdown-arrow');
    TestEvents.focus(input);
    input.click();
    hostFixture.detectChanges();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(input);
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(blurListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalledTimes(1);
  }));

  it('should receive focus making another managed area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const managedDropdown = hostFixture.nativeElement.querySelector('.managed .focusable-input') as HTMLInputElement;
    const baseDropdown = hostFixture.nativeElement.querySelector('.base .focusable-input') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .dropdown-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'otherDropdownBlured').and.callThrough();
    TestEvents.focus(managedDropdown);
    expect(hostDropdown.offsetWidth).toBe(0);
    TestEvents.focus(baseDropdown);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
  }));

  it('should receive focus making another unmanaged area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const baseDropdown = hostFixture.nativeElement.querySelector('.base .focusable-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .dropdown-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'unmanagedBlured').and.callThrough();
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    expect(hostDropdown.offsetWidth).toBe(0);
    TestEvents.focus(baseDropdown);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(hostDropdown.offsetWidth).toBeTruthy();
    expect(document.activeElement).toBe(baseDropdown);
  }));

  it('should lost focus when another control in managed area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const managedDropdown = hostFixture.nativeElement.querySelector('.managed .focusable-input') as HTMLInputElement;
    const baseDropdown = hostFixture.nativeElement.querySelector('.base .focusable-input') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .dropdown-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'otherDropdownFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'dropdownBlured').and.callThrough();
    TestEvents.focus(baseDropdown);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    TestEvents.focus(managedDropdown);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(baseDropdown);
  }));

  it('should lost focus when another control in unmanaged area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const baseDropdown = hostFixture.nativeElement.querySelector('.base .focusable-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .dropdown-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'unmanagedFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'dropdownBlured').and.callThrough();
    TestEvents.focus(baseDropdown);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(baseDropdown);
  }));

  it('should show only a part of items with scroll-bar when list is too large', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(LongListComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    hostFixture.detectChanges();
    const items: Array<HTMLElement> = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-item'));
    const scrollArea = hostFixture.nativeElement.querySelector('.dropdown-list-container .ps');
    const visibleItems = items.filter((it) => TestHelper.isVisibleInsideScrollViewport(it, scrollArea));
    expect(visibleItems.length > 0).toBe(true);
    expect(visibleItems.length < 20).toBe(true);
    const container = hostFixture.nativeElement.querySelector('.dropdown-list-container');
    expect(container.offsetHeight < 300).toBeTruthy();
    expect(scrollArea.classList.contains('ps--active-y')).toBeTruthy();
  }));

  it('should support programming scrolling to items when scrollbar is shown', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(LongListComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    hostFixture.detectChanges();
    const items: Array<HTMLElement> = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-item'));
    const scrollArea = hostFixture.nativeElement.querySelector('.dropdown-list-container .ps');
    expect(items.length).toBe(20);
    expect(TestHelper.isVisibleInsideScrollViewport(items[19], scrollArea)).toBeFalsy();
    scrollArea.scrollTop = scrollArea.offsetWidth;
    expect(TestHelper.isVisibleInsideScrollViewport(items[19], scrollArea)).toBeTruthy();
  }));

  it('should scroll to selected item when dropdown opens', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(LongListComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.componentInstance.value = longList[19];
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items: Array<HTMLElement> = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-item'));
    const scrollArea = hostFixture.nativeElement.querySelector('.dropdown-list-container .ps');
    expect(items.length).toBe(20);
    expect(TestHelper.isVisibleInsideScrollViewport(items[19], scrollArea)).toBeTruthy();
  }));

  it('should scroll to first selected items out of multiple when dropdown opens', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(LongListMultiComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items: Array<HTMLElement> = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-item'));
    const scrollArea = hostFixture.nativeElement.querySelector('.dropdown-list-container .ps');
    expect(items.length).toBe(20);
    expect(TestHelper.isVisibleInsideScrollViewport(items[9], scrollArea)).toBeTruthy();
    expect(TestHelper.isVisibleInsideScrollViewport(items[15], scrollArea)).toBeFalsy();
  }));

  it('should not show scrollbar when there are only a few items', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const scrollArea = fixture.nativeElement.querySelector('.dropdown-list-container .ps');
    expect(scrollArea.classList.contains('ps--active-y')).toBeFalsy();
    const rail = fixture.nativeElement.querySelector('.dropdown-list-container .ps__rail-y');
    expect(rail.offsetWidth === 0 && rail.offsetHeight === 0).toBeTruthy();
  }));

  it('should not let open dropdown when disabled (neighter by focus, nor by clicking)', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.componentInstance.form.controls.dropdown.disable();
    hostFixture.detectChanges();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const dropdownEl = hostFixture.nativeElement.querySelector('.dropdown-list-container');
    expect(dropdownEl.offsetWidth).toBe(0);
    const icon = hostFixture.nativeElement.querySelector('.dropdown-arrow');
    icon.click();
    expect(dropdownEl.offsetWidth).toBe(0);
    expect(hostFixture.nativeElement.querySelector('.dropdown-field').classList.contains('disabled')).toBeTruthy();
  }));

  it('should output html from formatter when provided', fakeAsync(() => {
    dropdown.formatter = (x: ListItem) => '<b>' + x.text + '</b>';
    fixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const firstItem = fixture.nativeElement.querySelector('.dropdown-item .dropdown-item-text');
    expect(firstItem.innerHTML).toBe('<b>1</b>');
    const fieldText = fixture.nativeElement.querySelector('.dropdown-field .selected-value-text');
    expect(fieldText.innerHTML).toBe('<b>2</b>');
  }));

  it('should escape items when escapeHtml flag is set ative', fakeAsync(() => {
    dropdown.escapeHtml = true;
    dropdown.formatter = (x: ListItem) => '<b>' + x.text + '</b>';
    fixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const firstItem = fixture.nativeElement.querySelector('.dropdown-item .dropdown-item-text');
    expect(firstItem.innerHTML).toBe('&lt;b&gt;1&lt;/b&gt;');
    const fieldText = fixture.nativeElement.querySelector('.dropdown-field .selected-value-text');
    expect(fieldText.innerHTML).toBe('&lt;b&gt;2&lt;/b&gt;');
  }));

  it('should clear selected single item via button drop item when clearButton is activated', () => {
    dropdown.clearButton = true;
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('.dropdown-field .remove-item');
    expect(clearButton).not.toBeNull();
    clearButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(null);
    expect(field.textContent).toBe(EMPTY);
  });

  it('should let remove items one by one from selection with clearButton button in multiselection', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InitialValueMultiComponent);
    hostFixture.componentInstance.dropdown.clearButton = true;
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    let clearButtons = hostFixture.nativeElement.querySelectorAll('.dropdown-field .remove-item');
    expect(clearButtons.length).toBe(2);
    expect(hostFixture.componentInstance.value.length).toBe(2);
    clearButtons[0].click();
    hostFixture.detectChanges();
    clearButtons = hostFixture.nativeElement.querySelectorAll('.dropdown-field .remove-item');
    expect(clearButtons.length).toBe(1);
    expect(hostFixture.componentInstance.value.length).toBe(1);
    clearButtons[0].click();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.value.length).toBe(0);
    const hostField = hostFixture.nativeElement.querySelector('.dropdown-field');
    expect(hostField.textContent).toBe(EMPTY);
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should truncate content if it overflows the field with nowrap activated', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(OverflowTestComponent);
    hostFixture.componentInstance.dropdown.nowrap = true;  // long values truncated
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const values = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-values .dropdown-value'));
    const valueFieldArea = hostFixture.nativeElement.querySelector('.dropdown-field');
    expect(values.every((value) => TestHelper.isVisibleInsideScrollViewport(value as HTMLElement, valueFieldArea))).toBeFalsy();
    expect(valueFieldArea.clientHeight < 50).toBeTruthy();
  }));

  it('should allow hyphenation (with height increasing) when nowrap is set to false', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(OverflowTestComponent);
    hostFixture.componentInstance.dropdown.nowrap = false;  // long values hyphenated
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    const values = Array.from(hostFixture.nativeElement.querySelectorAll('.dropdown-values .dropdown-value'));
    const valueFieldArea = hostFixture.nativeElement.querySelector('.dropdown-field');
    expect(values.every((value) => TestHelper.isVisibleInsideScrollViewport(value as HTMLElement, valueFieldArea))).toBeTruthy();
    expect(valueFieldArea.clientHeight < 50).toBeFalsy();
  }));

  it('should highlight the item if mouse is over it', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    items[0].dispatchEvent(TestEvents.mouseleave());
    items[1].dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeFalsy();
    expect(items[1].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should let highlight item manually using keyboard control', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeFalsy();
    expect(items[1].classList.contains('highlighted')).toBeTruthy();
    TestEvents.arrowUp(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[1].classList.contains('highlighted')).toBeFalsy();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should not highlight 2 elements from both mouse and keyboard simultaneously', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[2].dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelectorAll('.dropdown-item.highlighted');
    expect(highlighted.length).toBe(1);
  }));

  it('should correctly handle tail elements when highlighting using keyboard', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowUp(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[2].classList.contains('highlighted')).toBeTruthy();
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should jump over hidden elements if they are preset in list when moving using keyboard', fakeAsync(() => {
    component.list = [{id: 4, text: '4'}, {id: 5, text: '5', hidden: true}, {id: 6, text: '6'}, {id: 7, text: '7'}];
    fixture.detectChanges();
    tick();
    dropdown.returnFocus();
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    expect(items[1].offsetWidth).toBe(0);
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[2].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should jump over hidden tail elements if they are present in list when navigating with keyboard', fakeAsync(() => {
    component.list = [{id: 4, text: '4', hidden: true}, {id: 5, text: '5'},
      {id: 6, text: '6'}, {id: 7, text: '7'}, {id: 8, text: '8', hidden: true}];
    fixture.detectChanges();
    tick();
    dropdown.returnFocus();
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[1].classList.contains('highlighted')).toBeTruthy();
    TestEvents.arrowUp(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[3].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should scroll to navigated element when navigating with keyboard', fakeAsync(() => {
    component.list = [{id: 1, text: 'aaa'}, {id: 2, text: 'aab'}, {id: 3, text: 'aac'}, {id: 4, text: 'aad'},
        {id: 5, text: 'aae'}, {id: 6, text: 'aaf'}, {id: 7, text: 'aag'}, {id: 8, text: 'aah'},
        {id: 9, text: 'aai'}, {id: 10, text: 'aaj'}, {id: 11, text: 'aak'}];
    fixture.detectChanges();
    dropdown.returnFocus();
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.dropdown-item'));
    const scrollArea = fixture.nativeElement.querySelector('.dropdown-list-container .ps');
    expect(TestHelper.isVisibleInsideScrollViewport(items[9], scrollArea)).toBeFalsy();
    for (let i = 0; i < 9; i++) {
      TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    }
    expect(TestHelper.isVisibleInsideScrollViewport(items[9], scrollArea)).toBeTruthy();
  }));

  it('should let select particular item after keyboard navigation with enter', fakeAsync(() => {
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    TestEvents.enter(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    tick();
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).toBe(0);
    expect(component.value.id).toBe(1);
  }));

  it('should let add and remove items from selection using space in keyboard navigation multimode', fakeAsync(() => {
    component.value = [shortList[0]];
    dropdown.multi = true;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    TestEvents.pressSymbol(document.activeElement as HTMLInputElement, 'Space', ' ');
    fixture.detectChanges(); // 1st item selection removed
    tick();
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).not.toBe(0);
    expect(component.value.length).toBe(0);
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[1].classList.contains('highlighted')).toBeTruthy();
    TestEvents.pressSymbol(document.activeElement as HTMLInputElement, 'Space', ' ');
    fixture.detectChanges();  // 2nd item added to selection
    tick();
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).not.toBe(0);
    expect(component.value[0].id).toBe(2);
  }));

  it('should close dropdown by Esc and open it back by Enter', fakeAsync(() => {
    dropdown.returnFocus();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.escape(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).toBe(0);
    TestEvents.enter(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(fixture.nativeElement.querySelector('.dropdown-list-container').offsetWidth).not.toBe(0);
  }));

  it('should mark as touched when first opened', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.dropdown.touched).toBeFalsy();
    hostFixture.componentInstance.dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.dropdown.touched).toBeTruthy();
  }));

  it('should have invalid class when invalid', fakeAsync(() => {
    expect(field.classList.contains('invalid')).toBeFalsy();
    dropdown.invalid = true;
    dropdown.validationShowOn = 'immediate';
    dropdown.check();
    fixture.detectChanges();
    expect(field.classList.contains('invalid')).toBeTruthy();
    dropdown.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(field.classList.contains('invalid')).toBeTruthy();
  }));

  it('should let transparently pass mouse events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    hostFixture.detectChanges();
    tick();
    field = hostFixture.nativeElement.querySelector('.dropdown-field') as HTMLElement;
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
    hostFixture.detectChanges();
    tick();
    field = hostFixture.nativeElement.querySelector('.dropdown-field') as HTMLElement;
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

  it('should emit focus, blur events as usual input', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    hostFixture.detectChanges();
    tick();
    const input = hostFixture.nativeElement.querySelector('.focusable-input') as HTMLInputElement;
    const eventHost = hostFixture.componentInstance;
    const focusListener = spyOn(eventHost, 'focus').and.callThrough();
    const blurListener = spyOn(eventHost, 'blur').and.callThrough();
    input.dispatchEvent(new Event('focus'));
    expect(focusListener).toHaveBeenCalled();
    input.dispatchEvent(new Event('blur'));
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(blurListener).toHaveBeenCalled();
  }));

  it('should emit change event when selection changed, but not programmatically', fakeAsync(() => {
    const changeListener = spyOn(component, 'onChange').and.callThrough();
    component.value = shortList[2];
    tick();
    expect(changeListener).not.toHaveBeenCalled();
    dropdown.openDropdown();
    tick(SCROLLBAR_UPDATE_TIMING);
    let items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[0].click();
    fixture.detectChanges();
    tick();
    expect(changeListener).toHaveBeenCalled();
    expect(component.value.id).toBe(1);
    dropdown.multi = true;
    dropdown.openDropdown();
    tick(SCROLLBAR_UPDATE_TIMING);
    items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[2].click();
    fixture.detectChanges();
    tick();
    expect(changeListener).toHaveBeenCalledTimes(2);
    expect(component.value.length).toBe(2);
  }));

});

import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LookupComponent } from './lookup.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ClickOutsideDirective } from '../../directives/click-outside/click-out.directive';
import { ListItem, ListItemConverter, SubstringHighlightedItem, LookupProvider } from '../../models/dropdown.model';
import { of, throwError, timer } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { ThrobberComponent } from '../throbber/throbber.component';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { TestHelper } from '../../mocks/test.helper';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { LoadService } from '../../services/load/load.service';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';
import { ConstantsService } from '../../services/constants.service';
import { BLUR_TO_FOCUS_COMMON_DELAY } from '../../services/focus/focus.manager';

const DEFAULT_QUERY_DEBOUNCE = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
const SCROLLBAR_UPDATE_TIMING = 50;
const shortList = [{id: 1, text: '1111'}, {id: 2, text: '2222'}, {id: 3, text: '3333'},
    {id: 4, text: '1122'}, {id: 5, text: '1133'}, {id: 6, text: '2233'}];
const missingList = [shortList[1], shortList[2], shortList[3], shortList[4], shortList[5]];

@Component({
  template: `<lib-lookup #lookup [fixedItems]="list" [(ngModel)]="value" (changed)="onChange()"></lib-lookup>`
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
  @ViewChild('lookup', {static: true}) public lookup: LookupComponent;
  public onChange() {}
}

@Component({
  template: `<div [formGroup]="form"><lib-lookup #lookup [fixedItems]="list" formControlName="lookup"></lib-lookup></div>`
})
class FormControlComponent {
  public list = shortList;
  public form = new FormGroup({lookup: new FormControl(shortList[0])});
  @ViewChild('lookup', {static: true}) public lookup: LookupComponent;
}

@Component({
  template: `<lib-lookup #lookup [fixedItems]="list" [(ngModel)]="value"></lib-lookup>`
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
  @ViewChild('lookup', {static: true}) public lookup: LookupComponent;
}

@Component({
  template: `<lib-lookup #lookup [fixedItems]="list" [(ngModel)]="value"></lib-lookup>`
})
class EmptyModelComponent {
  public value = null;
  public list = shortList;
  @ViewChild('lookup', {static: true}) public lookup: LookupComponent;
}

@Component({
  template: `<lib-lookup #managed [fixedItems]="list" [(ngModel)]="value" (focus)="otherLookupFocusReceived()"
                (blur)="otherLookupBlured()" contextClass="managed"></lib-lookup>
    <lib-lookup #lookup [fixedItems]="list" [(ngModel)]="value" (focus)="focusReceived()"
                (blur)="lookupBlured()" contextClass="base"></lib-lookup>
    <input type="text" #unmanaged (focus)="unmanagedFocusReceived()"
                (blur)="unmanagedBlured()" class="unmanaged"/>`
})
class FocusTestComponent {
  public list = shortList;
  public value = shortList[0];
  @ViewChild('managed', {static: true})
  public managed: LookupComponent;
  @ViewChild('unmanaged', {static: true})
  public unmanaged: HTMLInputElement;
  @ViewChild('lookup', {static: true})
  public lookup: LookupComponent;
  public otherLookupFocusReceived() {}
  public otherLookupBlured() {}
  public focusReceived() {}
  public lookupBlured() {}
  public unmanagedFocusReceived() {}
  public unmanagedBlured() {}
}

@Component({
  template: `<lib-lookup [fixedItems]="list" (input)="input()" (focus)="focus()" (blur)="blur()"
            (keydown)="keydown()" (keyup)="keyup()" (keypress)="keypress()" (click)="click()"
            (touchstart)="touchstart()" (touchend)="touchend()" (touchmove)="touchmove()"
                (mousedown)="mousedown()" (mouseup)="mouseup()"
            (mouseenter)="mouseenter()" (mouseleave)="mouseleave()" (mouseover)="mouseover()"
                (mouseout)="mouseout()" (mousemove)="mousemove()"></lib-lookup>`
})
class EventTestComponent {
  public list = shortList;
  public focus() {}
  public blur() {}
  public input() {}
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

function doubleTick(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

function waitOpening(fixture: ComponentFixture<any>, searchTime?: number) {
  tick(DEFAULT_QUERY_DEBOUNCE);
  fixture.detectChanges();
  if (searchTime) {
    tick(searchTime);
    fixture.detectChanges();
  }
  tick(SCROLLBAR_UPDATE_TIMING);
  fixture.detectChanges();
}

describe('LookupComponent', () => {

  let component: NgModelComponent;
  let fixture: ComponentFixture<NgModelComponent>;
  let lookup: LookupComponent;
  let field: HTMLElement;
  let input: HTMLInputElement;
  let icon: HTMLElement;
  let setter: jasmine.Spy<any>;
  let search: jasmine.Spy<any>;
  let dropdown: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule ],
      providers: [{ provide: LoadService, useClass: LoadServiceStub }],
      declarations: [
        LookupComponent, SearchBarComponent, ClickOutsideDirective, ThrobberComponent, SafeHtmlPipe, NgModelComponent,
        FormControlComponent, InvalidModelComponent, EmptyModelComponent, FocusTestComponent, EventTestComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(NgModelComponent);
    component = fixture.componentInstance;
    lookup = component.lookup;
    doubleTick(fixture);
    field = fixture.nativeElement.querySelector('.search-field');
    input = fixture.nativeElement.querySelector('.search-input');
    icon = fixture.nativeElement.querySelector('.search-go');
    dropdown = fixture.nativeElement.querySelector('.lookup-list-container');
    setter = spyOnProperty(component, 'value', 'set').and.callThrough();
    search = spyOn(lookup, 'lookupItems').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pick up initial model from ngModel', () => {
    expect(component.value.id).toBe(1);
    expect(lookup.item.id).toBe(1);
    expect(setter).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
  });

  it('should pick up initial model value as reactive form control', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOn(componentInstance.form.controls.lookup, 'setValue').and.callThrough();
    const componentInput = hostFixture.nativeElement.querySelector('.search-input');
    expect(componentInstance.form.controls.lookup.value.id).toBe(1);
    expect(componentInstance.lookup.item.id).toBe(1);
    expect(componentSetter).not.toHaveBeenCalled();
    expect(componentInput.value).toBe('1111');
  }));

  it('should bind-in to ngModel', fakeAsync(() => {
    expect(input.value).toBe('1111');
    component.value = shortList[2];
    doubleTick(fixture);
    expect(input.value).toBe('3333');
    expect(lookup.item.id).toBe(3);
  }));

  it('should bind-out to ngModel', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lookup-list-container').classList.contains('hidden')).toBe(true);
    expect(component.value.id).toBe(6);
  }));

  it('should bind-in to reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    const hostInput = hostFixture.nativeElement.querySelector('.search-input');
    expect(hostInput.value).toBe('1111');
    hostFixture.componentInstance.form.controls.lookup.setValue(shortList[4]);
    doubleTick(hostFixture);
    expect(hostFixture.componentInstance.form.controls.lookup.value.id).toBe(5);
    expect(hostInput.value).toBe('1133');
  }));

  it('should bind-out to reactive form', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOn(componentInstance.form.controls.lookup, 'setValue').and.callThrough();
    const hostInput = hostFixture.nativeElement.querySelector('.search-input');
    const hostIcon = hostFixture.nativeElement.querySelector('.search-go');
    TestEvents.focus(hostInput);
    hostInput.value = '22';
    hostInput.dispatchEvent(TestEvents.input());
    waitOpening(hostFixture);
    const items = hostFixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(hostFixture);
    expect(hostInput.value).toBe('2233');
    expect(componentSetter).toHaveBeenCalled();
    expect(componentInstance.form.controls.lookup.value === shortList[5]).toBeTruthy();
  }));

  it('should commit original item (not synthetic or cloned) if used without converter', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(fixture);
    expect(component.value === shortList[5]).toBeTruthy();
  }));

  it('should commit converted (may be synthetic) item if used with converter', fakeAsync(() => {
    lookup.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => ({id: x.id, text: x.text})
    );
    component.list = [shortList[0], shortList[1], shortList[2], shortList[3], shortList[4], shortList[5]]; // clone to force convertion
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(fixture);
    expect(dropdown.classList.contains('hidden')).toBe(true);
    expect(component.value.id).toBe(6);
    expect(component.value === shortList[5]).toBeFalsy();
    expect(component.value.id === shortList[5].id).toBeTruthy();
  }));

  it('should store originalItem (not synthetic) in originalItem even if passed through converter', fakeAsync(() => {
    lookup.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => x.originalItem
    );
    component.list = [shortList[0], shortList[1], shortList[2], shortList[3], shortList[4], shortList[5]]; // clone to force convertion
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(fixture);
    expect(component.value === shortList[5]).toBeTruthy();
  }));

  it('should commit original item (not synthetic or cloned) if it is received from provider', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((it) => it.text.includes(query)));
      }
    })();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(fixture);
    expect(component.value === shortList[5]).toBeTruthy();
  }));

  it('should apply converter to items received from provider same way as to fixedItems', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((it) => it.text.includes(query)));
      }
    })();
    lookup.converter = new ListItemConverter(
      (x: any) => new ListItem(x, x),
      (x: ListItem) => ({id: x.id, text: x.text})
    );
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[items.length - 1].click();
    doubleTick(fixture);
    expect(fixture.nativeElement.querySelector('.lookup-list-container').classList.contains('hidden')).toBe(true);
    expect(component.value.id).toBe(6);
    expect(component.value === shortList[5]).toBeFalsy();
    expect(component.value.id === shortList[5].id).toBeTruthy();
  }));

  it('should render and not commit back (fix) inconsistent initial value when touched', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(InvalidModelComponent);
    doubleTick(hostFixture);
    const componentInstance = hostFixture.componentInstance;
    const componentSetter = spyOnProperty(componentInstance, 'value', 'set').and.callThrough();
    const componentInput = hostFixture.nativeElement.querySelector('.search-input');
    componentInstance.lookup.returnFocus();
    tick(SCROLLBAR_UPDATE_TIMING);
    tick(DEFAULT_QUERY_DEBOUNCE);
    TestEvents.blur(componentInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(componentInput.value).toBe('4'); // list doesn't contain '4'
    expect(componentSetter).not.toHaveBeenCalled();
  }));

  it('should not initiate search when initial value is applied', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    const hostSearch = spyOn(hostFixture.componentInstance.lookup, 'lookupItems').and.callThrough();
    hostFixture.detectChanges();
    tick();
    hostFixture.detectChanges();
    expect(hostSearch).not.toHaveBeenCalled();
  }));

  it('should not check for consistency (trust) current item when provider is changed', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(missingList.filter((item) => item.text.includes(query)));
      }
    })();
    fixture.detectChanges();
    expect(input.value).toBe('1111');
    expect(lookup.item.id).toBe(1);
    expect(search).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should check for consistency and reset if wrong when fixed list is changed', fakeAsync(() => {
    lookup.fixedItems = missingList;
    lookup.update();
    doubleTick(fixture);
    expect(input.value).toBe('');
    expect(lookup.item).toBeNull();
    expect(search).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
  }));

  it('should consume array of predefined items as search list', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    expect(items.map((it) => it.textContent).includes('1122')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('2222')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('2233')).toBeTruthy();
  }));

  it('should consume array of predefined convertable items as search list', fakeAsync(() => {
    lookup.converter = new ListItemConverter(
      (x: any) => new ListItem({id: x.t, text: x.str}, x),
      (x: ListItem) => x.originalItem
    );
    lookup.fixedItems = [{t: 1, str: '1111'}, {t: 2, str: '1211'}, {t: 3, str: '1113'}, {t: 4, str: '4111'}, {t: 5, str: '1181'}];
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '111';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    expect(items.map((it) => it.textContent).includes('1111')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('1113')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('4111')).toBeTruthy();
  }));

  it('should consume items from provider as search list', fakeAsync(() => {
    const values = [{id: 1, text: '1111'}, {id: 2, text: '1211'}, {id: 3, text: '1113'}, {id: 4, text: '4111'}, {id: 5, text: '1181'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(values.filter((item) => item.text.includes(query)));
      }
    })();
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '111';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    expect(items.map((it) => it.textContent).includes('1111')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('1113')).toBeTruthy();
    expect(items.map((it) => it.textContent).includes('4111')).toBeTruthy();
    items[2].click(); // 0: 1, 1: 3, 2: 4
    doubleTick(fixture);
    expect(component.value === values[3]).toBeTruthy();
  }));

  it('should consume items from delayed source provider as search list', fakeAsync(() => {
    const values = [{id: 1, text: '1121'}, {id: 2, text: '1211'}, {id: 3, text: '1112'}, {id: 4, text: '2111'}, {id: 5, text: '1181'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(values.filter((item) => item.text.includes(query))).pipe(delay(500));
      }
    })();
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '21';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture, 500);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    items[2].click(); // 0: 1, 1: 2, 2: 4
    fixture.detectChanges();
    expect(component.value === values[3]).toBeTruthy();
  }));

  it('should consume items from delayed source provider through converter as search list', fakeAsync(() => {
    const values = [{t: 1, str: '1111'}, {t: 2, str: '1211'}, {t: 3, str: '113'}, {t: 4, str: '4111'}, {t: 5, str: '11181'}];
    lookup.converter = new ListItemConverter(
      (x: any) => new ListItem({id: x.t, text: x.str}, x),
      (x: ListItem) => x.originalItem
    );
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(values.filter((item) => item.str.includes(query))).pipe(delay(500));
      }
    })();
    lookup.update();
    lookup.returnFocus();
    input.value = '111';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture, 500);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    items[2].click(); // 0: 1, 1: 4, 2: 5
    fixture.detectChanges();
    expect(component.value === values[4]).toBeTruthy();
  }));

  it('should consume items from delayed promise-based source provider as search list', fakeAsync(() => {
    const values = [{id: 1, text: '1121'}, {id: 2, text: '1211'}, {id: 3, text: '1112'}, {id: 4, text: '2111'}, {id: 5, text: '12181'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        let resolve;
        const result: Promise<any[]> = new Promise((res, rej) => {resolve = res; });
        setTimeout(() => resolve(values.filter((item) => item.text.includes(query))), 500);
        return result;
      }
    })();
    lookup.update();
    lookup.returnFocus();
    input.value = '21';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture, 500);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(4);
    items[3].click(); // 0: 1, 1: 2, 2: 4, 3: 5
    fixture.detectChanges();
    expect(component.value === values[4]).toBeTruthy();
  }));

  it('should use source provider over fixed items if both provided', fakeAsync(() => {
    lookup.fixedItems = [{id: 1, text: '1111'}, {id: 2, text: '1121'}, {id: 3, text: '1211'}];
    const values = [{id: 4, text: '1121'}, {id: 5, text: '2111'}, {id: 6, text: '3211'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(values.filter((it) => it.text.includes(query)));
      }
    })();
    lookup.update();
    lookup.returnFocus();
    input.value = '21';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.length).toBe(3);
    items[2].click();
    fixture.detectChanges();
    expect(component.value.id).toBe(6);
  }));

  it('should put into the queue new search if prev search is not yet complete', fakeAsync(() => {
    const values = [{id: 1, text: '1111'}, {id: 2, text: '1121'}, {id: 3, text: '1131'},
      {id: 4, text: '2212'}, {id: 5, text: '2221'}, {id: 6, text: '2232'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(values.filter((it) => it.text.includes(query))).pipe(delay(1000));
      }
    })();
    lookup.update();
    lookup.returnFocus();
    input.click();
    input.value = '11'; // first text query formed @(-700)
    input.dispatchEvent(TestEvents.input());  //
    tick(DEFAULT_QUERY_DEBOUNCE); // first search starts @0
    fixture.detectChanges();
    tick(100);
    input.value = '21';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);  // second search scheduled @100+700
    fixture.detectChanges();
    expect(dropdown.offsetWidth).toBe(0); // first search is in progress, second scheduled
    tick(200);
    doubleTick(fixture); // first search completes @100+700+200=1000, second starts @1000
    expect(dropdown.offsetWidth).not.toBe(0);
    let items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.every((item) => item.textContent.includes('11'))).toBeTruthy();
    tick(1000);  // second search completes @1000+1000=2000
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    items = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.every((item) => item.textContent.includes('21'))).toBeTruthy();
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should highlight found substring when presenting search results by default', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(dropdown.offsetWidth).not.toBe(0);
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings.length).toBe(3);
    expect(itemsHighlightings.every((highlight) => highlight.textContent === '33')).toBeTruthy();
  }));

  it('should not highlight found substring if highlightSubstring is disabled', fakeAsync(() => {
    lookup.highlightSubstring = false;
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const itemsFound: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .item-container'));
    expect(itemsFound.length).toBe(3);
    expect(itemsFound.every((item) => item.textContent.includes('33'))).toBeTruthy();
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings.length).toBe(0);
  }));

  it('should highlight found substring if search done with case ignorance', fakeAsync(() => {
    component.list = [{id: 1, text: 'AAaa'}, {id: 2, text: 'aaBB'}, {id: 3, text: 'bbBB'}, {id: 4, text: 'AAbb'}];
    lookup.searchCaseSensitive = false;
    lookup.returnFocus();
    fixture.detectChanges();
    input.value = 'aa';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const itemsFound: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .item-container'));
    expect(itemsFound.length).toBe(3);
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings.length).toBe(3);
    expect(itemsHighlightings.every((item) => item.textContent === 'aa' || item.textContent === 'AA')).toBeTruthy();
  }));

  it('should highlight found substring if search done with case ignorance', fakeAsync(() => {
    component.list = [{id: 1, text: 'ФФбб'}, {id: 2, text: 'ффББ'}, {id: 3, text: 'ббББ'}, {id: 4, text: 'ФФбб'}];
    lookup.searchCaseSensitive = false;
    lookup.returnFocus();
    fixture.detectChanges();
    input.value = 'фф';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const itemsFound: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .item-container'));
    expect(itemsFound.length).toBe(3);
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings.length).toBe(3);
    expect(itemsHighlightings.every((item) => item.textContent === 'фф' || item.textContent === 'ФФ')).toBeTruthy();
  }));

  it('should highlight found substring if search performed from beginning of a string only', fakeAsync(() => {
    component.list = [{id: 1, text: 'AAaa'}, {id: 2, text: 'aaBB'}, {id: 3, text: 'bbAA'},
      {id: 4, text: 'BBaa'}, {id: 5, text: 'bbBB'}, {id: 6, text: 'AAbb'}];
    lookup.searchCaseSensitive = false;
    lookup.searchFromStartOnly = true;
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'aa';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const itemsFound: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .item-container'));
    expect(itemsFound.length).toBe(3);
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings.length).toBe(3);
    expect(itemsHighlightings.every((item) => item.textContent === 'aa' || item.textContent === 'AA')).toBeTruthy();
    expect(itemsHighlightings.every((item) => item.previousSibling.textContent === '')).toBeTruthy();
  }));

  it('should not brake render if required substring is not found in provider results', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of([{id: 7, text: 'qwgeqw'}]);
      }
    })();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const itemsFound: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .item-container'));
    expect(itemsFound.length).toBe(1);
    expect(itemsFound[0].textContent).toBe('qwgeqw');
    const itemsHighlightings: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(itemsHighlightings[0].textContent).toBe('');
  }));

  it('should let select item from search results when clicked', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    expect(items.length).toBe(3);
    items[1].click();
    doubleTick(fixture);
    expect(input.value).toBe('1133');
    expect(component.value.id).toBe(5);
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should not reset current item if search list is closed without selecting', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    expect(items.length).toBe(3);
    icon.click();
    fixture.detectChanges();
    expect(input.value).toBe('33'); // query string is not reverted and search is ready for recall
    expect(component.value.id).toBe(1); // not changed since selecting is not yet performed
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should reset current item if field is broken and left with clearInconsistent', fakeAsync(() => {
    lookup.clearInconsistent = 'reset';
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '33'; // brake correspondent value with new text query
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    icon.click();  // cancel current search
    fixture.detectChanges();
    expect(input.value).toBe('33'); // query string is not reverted and search is ready for recall
    expect(component.value.id).toBe(1); // not changed since selecting is not yet performed as well as leaving
    expect(dropdown.offsetWidth).toBe(0);
    TestEvents.blur(input);  // now field is left with broken text not correspondent to the item
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    doubleTick(fixture);
    expect(input.value).toBe('');
    expect(component.value).toBeNull();
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should not revert broken value if field is broken and left with clearInconsistent deactivated', fakeAsync(() => {
    lookup.clearInconsistent = 'ignore';
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '33'; // brake correspondent value with new text query
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    icon.click();  // cancel current search
    fixture.detectChanges();
    expect(input.value).toBe('33'); // query string is not reverted and search is ready for recall
    expect(component.value.id).toBe(1); // not changed since selecting is not yet performed as well as leaving
    expect(dropdown.offsetWidth).toBe(0);
    TestEvents.blur(input);  // now field is left with broken text not correspondent to the item
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(input.value).toBe('33');
    expect(component.value.id).toBe(1);
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should open dropdown and validate item by search when focusing', fakeAsync(() => {
    TestEvents.focus(input);
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('1111');
  }));

  it('should not initiate search when entered not enough symbols', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EmptyModelComponent);
    hostFixture.componentInstance.lookup.queryMinSymbolsCount = 2;
    doubleTick(hostFixture);
    const hostInput = hostFixture.nativeElement.querySelector('.search-input');
    const hostIcon = hostFixture.nativeElement.querySelector('.search-go');
    hostFixture.componentInstance.lookup.returnFocus();
    hostInput.value = '1';
    hostInput.dispatchEvent(TestEvents.input());
    waitOpening(hostFixture);
    const hostDropdown = hostFixture.nativeElement.querySelector('.lookup-list-container');
    expect(hostDropdown.offsetWidth).toBe(0);
    hostIcon.click();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(hostDropdown.offsetWidth).toBe(0);
  }));

  it('should respect queryMinSymbolsCount property', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EmptyModelComponent);
    hostFixture.componentInstance.lookup.queryMinSymbolsCount = 3;
    doubleTick(hostFixture);
    const hostInput = hostFixture.nativeElement.querySelector('.search-input');
    const hostIcon = hostFixture.nativeElement.querySelector('.search-go');
    hostFixture.componentInstance.lookup.returnFocus();
    hostInput.value = '22';
    hostInput.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    hostFixture.detectChanges();
    const hostDropdown = hostFixture.nativeElement.querySelector('.lookup-list-container');
    expect(hostDropdown.offsetWidth).toBe(0);
    hostInput.value = '222';
    hostInput.dispatchEvent(TestEvents.input());
    waitOpening(hostFixture);
    expect(hostDropdown.offsetWidth).not.toBe(0);
  }));

  it('should respect custom queryTimeout', fakeAsync(() => {
    lookup.queryTimeout = 2000;
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).toBe(0);
    tick(2000 - DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should initiate search when icon is clicked and there are enough symbols (unfocused)', fakeAsync(() => {
    expect(search).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
    icon.click();
    expect(search).toHaveBeenCalled();
    expect(input === document.activeElement).toBeTruthy();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
  }));

  it('should initiate search when icon clicked and there are enough symbols (focused)', fakeAsync(() => {
    lookup.returnFocus(); // programmatic focus returning doesn't initiate search
    // required to not consider clicking on input field, when focus and click events goes together
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(input === document.activeElement).toBeTruthy();
    fixture.detectChanges();
    expect(search).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
    expect(dropdown.offsetWidth).toBe(0);
    icon.click();
    expect(search).toHaveBeenCalled();
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
  }));

  it('should initiate search and show dropdown when text entered (with debounce)', fakeAsync(() => {
    lookup.returnFocus();
    fixture.detectChanges();
    expect(search).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
    expect(dropdown.offsetWidth).toBe(0);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(input === document.activeElement).toBeTruthy();
    expect(dropdown.offsetWidth).not.toBe(0);
  }));

  it('should initiate search and show dropdown when field clicked (being unfocused)', fakeAsync(() => {
    expect(search).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
    TestEvents.focus(input);
    input.click();
    expect(search).toHaveBeenCalled();
    expect(input === document.activeElement).toBeTruthy();
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should initiate search when icon clicked and there are enough symbols (focused)', fakeAsync(() => {
    lookup.returnFocus(); // programmatic focus returning doesn't initiate search
    // required to not consider clicking on input field, when focus and click events goes together
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(input === document.activeElement).toBeTruthy();
    fixture.detectChanges();
    expect(search).not.toHaveBeenCalled();
    expect(input.value).toBe('1111');
    expect(dropdown.offsetWidth).toBe(0);
    input.click();
    expect(search).toHaveBeenCalled();
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should show loading image when delayed search is in process and hide it when done', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(500));
      }
    })();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber.offsetWidth).not.toBe(0);
    tick(500);
    fixture.detectChanges();
    expect(throbber.offsetWidth).toBe(0);
  }));

  it('should hide search results when icon clicked after the search is done', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    icon.click();
    doubleTick(fixture);
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should hide search results with field clicked after the search is done', fakeAsync(() => {
    lookup.returnFocus();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    input.click();
    doubleTick(fixture);
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should not hide search results (from prev search) when new search is in progress', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(1000));
      }
    })();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);  // first search started @0
    tick(100);
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE); // second search scheduled @800
    fixture.detectChanges();
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber.offsetWidth).not.toBe(0);
    expect(dropdown.offsetWidth).toBe(0);
    tick(200); // first search ends @1000, scheduled second search starts @1000
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    tick(500); // in the middle of the second search
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.every((item) => item.textContent.includes('11'))).toBeTruthy();
    tick(500); // second search ends @2000
  }));

  it('should allow selecting the item from previous search when new search is in progress', fakeAsync(() => {
    lookup.returnFocus();
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(1000));
      }
    })();
    fixture.detectChanges();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);  // first search started @0
    tick(1000);   // first search ended @1000
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE); // second search started @1700
    tick(500); // in the middle of the second search @2200
    fixture.detectChanges();
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber.offsetWidth).not.toBe(0);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.every((item) => item.textContent.includes('11'))).toBeTruthy();
    items[1].click();
    doubleTick(fixture);
    expect(input.value).toBe('1122');
    expect(component.value.id).toBe(4);
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).toBe(0);
    tick(500); // second search ends @2700, nothing changed
    expect(input.value).toBe('1122');
    expect(component.value.id).toBe(4);
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).toBe(0);
  }));

  it('should cancel scheduled search if item is selected during search in progress', fakeAsync(() => {
    lookup.returnFocus();
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(1000));
      }
    })();
    doubleTick(fixture);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);  // first search started @0
    tick(1000);
    doubleTick(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);  // first search completes @1000
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE); // second search started @1700
    tick(100);
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE); // third search scheduled @2500
    tick(100);
    doubleTick(fixture);
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    expect(items.every((item) => item.textContent.includes('11'))).toBeTruthy(); // still results from first search
    items[1].click();
    doubleTick(fixture);
    expect(input.value).toBe('1122');
    expect(component.value.id).toBe(4);
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).toBe(0);
    tick(200);  // second search completes @2700, nothing changed, third search doesn't started @2700
    expect(input.value).toBe('1122');
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).toBe(0);
    tick(1000); // third search would completed here if it had ever started
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should hide search results when clicked outside', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    hostFixture.componentInstance.lookup.returnFocus();
    const hostInput = hostFixture.nativeElement.querySelector('.base .search-input');
    hostInput.value = '11';
    hostInput.dispatchEvent(TestEvents.input());
    waitOpening(hostFixture);
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .lookup-list-container');
    expect(hostDropdown.offsetWidth).not.toBe(0);
    const anotherInput = hostFixture.nativeElement.querySelector('.unmanaged');
    anotherInput.click();
    doubleTick(hostFixture);
    expect(hostDropdown.offsetWidth).toBe(0);
  }));

  it('should hide dropdown when no items found and search is complete', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    input.value = '44';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).toBe(0); // nothing found
  }));

  it('should hide dropdown and loading icon when searching failed', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        if (query.includes('1')) {
          return of(shortList.filter((item) => item.text.includes(query)));
        } else {
          return throwError('failed');
        }
      }
    })();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    doubleTick(fixture);
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber).toBeNull();
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should not cancel scheduled search if search failed', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        if (query.includes('1')) {
          return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(1000));
        } else {
          return timer(1000).pipe(mergeMap(e => throwError('failed')));  // delayed throw
        }
      }
    })();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);  // first search started @0
    doubleTick(fixture);
    let throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber.offsetWidth).not.toBe(0);
    expect(dropdown.offsetWidth).toBe(0);
    tick(100);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE); // second search scheduled @800
    tick(200); // first search failed @1000, second search started @1000
    doubleTick(fixture);
    tick(500); // in the middle of second search
    throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).not.toBe(0);
    tick(500); // second search completes @2000
    waitOpening(fixture);
    throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(dropdown.offsetWidth).not.toBe(0);
    expect(throbber).toBeNull();
  }));

  it('should hide dropdwon when blured', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    TestEvents.blur(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).toBe(0);
  }));

  it('should not show search results if component was blured during search', fakeAsync(() => {
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string) {
        return of(shortList.filter((item) => item.text.includes(query))).pipe(delay(1000));
      }
    })();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    const throbber = fixture.nativeElement.querySelector('.search-in-progress');
    expect(throbber.offsetWidth).not.toBe(0);
    tick(300);
    TestEvents.blur(input);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(throbber.offsetWidth).toBe(0);
    tick(500);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).toBe(0);
    expect(throbber.offsetWidth).toBe(0);
  }));

  it('should pass caseSensitive and fromStartOnly flag to supporting provider', fakeAsync(() => {
    const values = [{id: 1, text: 'aab'}, {id: 2, text: 'baa'}, {id: 3, text: 'AAB'}];
    lookup.itemsProvider = new (class TestProvider implements LookupProvider {
      public search(query: string, configuration: any) {
        if (configuration.searchCaseSensitive) {
          return of(values.filter((it) => it.text.includes(query)));
        } else {
          return of(values.filter((it) => it.text.toUpperCase().includes(query.toUpperCase())));
        }
      }
    })();
    lookup.searchCaseSensitive = false;
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'aa';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(fixture.nativeElement.querySelectorAll('.lookup-item').length).toBe(3);
    lookup.searchCaseSensitive = true;
    fixture.detectChanges();
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(fixture.nativeElement.querySelectorAll('.lookup-item').length).toBe(2);
  }));

  it('should search ignoring case among fixed items when case sensitive set to false', fakeAsync(() => {
    lookup.fixedItems = [{id: 1, text: 'ЗЗзBb'}, {id: 2, text: 'bbзЗз'}, {id: 3, text: 'bЗЗЗb'}, {id: 4, text: 'зbзз'}];
    lookup.searchCaseSensitive = false;
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'ЗЗЗ';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    let items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    let highlight: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(items.length).toBe(3);
    expect(highlight.every((highlighting) => highlighting.textContent.toLowerCase().includes('ззз'))).toBeTruthy();
    input.value = 'ззз';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    items = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    highlight = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(items.length).toBe(3);
    expect(highlight.every((highlighting) => highlighting.textContent.toLowerCase().includes('ззз'))).toBeTruthy();
  }));

  it('should search from start only among fixed items when searchFromStartOnly flag is set', fakeAsync(() => {
    lookup.fixedItems = [{id: 1, text: 'ЗЗзBb'}, {id: 2, text: 'ЗзbbзЗз'},
      {id: 3, text: 'bЗЗЗb'}, {id: 4, text: 'зЗbзз'}, {id: 5, text: 'bзз'}];
    lookup.searchCaseSensitive = false;
    lookup.searchFromStartOnly = true;
    lookup.update();
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'зз';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    const highlight: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item .highlight-part'));
    expect(items.length).toBe(3);
    expect(highlight.every((highlighting) => highlighting.textContent.toLowerCase().includes('зз'))).toBeTruthy();
    expect(highlight.every((highlighting) => highlighting.previousSibling.textContent === '')).toBeTruthy();
  }));

  it('should immediately return focus to input when icon is clicked', fakeAsync(() => {
    lookup.returnFocus();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(input === document.activeElement);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    TestEvents.blur(input); // blur is raised by click
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(input === document.activeElement);
    expect(dropdown.offsetWidth).toBe(0);
    TestEvents.blur(input); // blur is raised by click
    icon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(input === document.activeElement);
    expect(dropdown.offsetWidth).not.toBe(0);
  }));

  it('should immediately return focus to input when item is selected from list', fakeAsync(() => {
    lookup.returnFocus();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(input === document.activeElement);
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    TestEvents.blur(input); // blur is raised by click
    items[1].click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    expect(dropdown.offsetWidth).toBe(0);
    expect(input === document.activeElement);
  }));

  it('should emit single focus event and no blur when input and next icon is clicked', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const hostInput = hostFixture.nativeElement.querySelector('.base .search-input');
    const hostIcon = hostFixture.nativeElement.querySelector('.base .search-go');
    TestEvents.focus(hostInput);
    hostInput.click();
    hostFixture.detectChanges();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(hostInput);
    hostIcon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(hostInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(focusListener).toHaveBeenCalled();
    expect(focusListener).toHaveBeenCalledTimes(1);
  }));

  it('should emit single blur after any actions inside control and further leaving', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const blurListener = spyOn(hostFixture.componentInstance, 'lookupBlured').and.callThrough();
    const hostInput = hostFixture.nativeElement.querySelector('.base .search-input');
    const hostIcon = hostFixture.nativeElement.querySelector('.base .search-go');
    TestEvents.focus(hostInput);
    hostInput.click();
    hostFixture.detectChanges();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(hostInput);
    hostIcon.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    TestEvents.blur(hostInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(blurListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalledTimes(1);
  }));

  it('should receive focus making another managed area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const managedLookup = hostFixture.nativeElement.querySelector('.managed .search-input') as HTMLInputElement;
    const baseLookup = hostFixture.nativeElement.querySelector('.base .search-input') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .lookup-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'otherLookupBlured').and.callThrough();
    TestEvents.focus(managedLookup);
    expect(hostDropdown.offsetWidth).toBe(0);
    TestEvents.focus(baseLookup);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    doubleTick(hostFixture);
    expect(hostDropdown.offsetWidth).not.toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
  }));

  it('should receive focus making another unmanaged area controls unfocused', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const baseLookup = hostFixture.nativeElement.querySelector('.base .search-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .lookup-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'focusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'unmanagedBlured').and.callThrough();
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    expect(hostDropdown.offsetWidth).toBe(0);
    TestEvents.focus(baseLookup);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    expect(document.activeElement).toBe(baseLookup);
  }));

  it('should lost focus when another control in managed area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const managedLookup = hostFixture.nativeElement.querySelector('.managed .search-input') as HTMLInputElement;
    const baseLookup = hostFixture.nativeElement.querySelector('.base .search-input') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .lookup-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'otherLookupFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'lookupBlured').and.callThrough();
    TestEvents.focus(baseLookup);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    TestEvents.focus(managedLookup);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(baseLookup);
  }));

  it('should lost focus when another control in unmanaged area receives focus', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FocusTestComponent);
    doubleTick(hostFixture);
    const baseLookup = hostFixture.nativeElement.querySelector('.base .search-input') as HTMLInputElement;
    const unmanagedInput = hostFixture.nativeElement.querySelector('.unmanaged') as HTMLInputElement;
    const hostDropdown = hostFixture.nativeElement.querySelector('.base .lookup-list-container') as HTMLElement;
    const focusListener = spyOn(hostFixture.componentInstance, 'unmanagedFocusReceived').and.callThrough();
    const blurListener = spyOn(hostFixture.componentInstance, 'lookupBlured').and.callThrough();
    TestEvents.focus(baseLookup);
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).not.toBe(0);
    TestEvents.focus(unmanagedInput);
    tick(BLUR_TO_FOCUS_COMMON_DELAY); // focus lost in unmanaged area notified asynchronously
    hostFixture.detectChanges();
    expect(hostDropdown.offsetWidth).toBe(0);
    expect(focusListener).toHaveBeenCalled();
    expect(blurListener).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(baseLookup);
  }));

  it('should show only a part of items with scroll-bar when search list is too large', fakeAsync(() => {
    component.list = [{id: 1, text: 'aaa'}, {id: 2, text: 'aab'}, {id: 3, text: 'aac'}, {id: 4, text: 'aad'},
      {id: 5, text: 'aae'}, {id: 6, text: 'aaf'}, {id: 7, text: 'aag'}, {id: 8, text: 'aah'},
      {id: 9, text: 'aai'}, {id: 10, text: 'aaj'}, {id: 11, text: 'aak'}];
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'aa';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    const scrollArea = fixture.nativeElement.querySelector('.lookup-list-container .ps');
    const visibleItems = items.filter((it) => TestHelper.isVisibleInsideScrollViewport(it, scrollArea));
    expect(visibleItems.length > 0).toBe(true);
    expect(visibleItems.length < 11).toBe(true);
    expect(dropdown.offsetHeight < 300).toBeTruthy();
    expect(scrollArea.classList.contains('ps--active-y')).toBeTruthy();
  }));

  it('should not show scrollbar when there are only a few items in search list', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '33';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const scrollArea = fixture.nativeElement.querySelector('.lookup-list-container .ps');
    expect(scrollArea.classList.contains('ps--active-y')).toBeFalsy();
    const rail = fixture.nativeElement.querySelector('.lookup-list-container .ps__rail-y');
    expect(rail.offsetWidth === 0 && rail.offsetHeight === 0).toBeTruthy();
  }));

  it('should not let entering text and initiating search when disabled', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    const hostSearch = spyOn(hostFixture.componentInstance.lookup, 'lookupItems').and.callThrough();
    hostFixture.componentInstance.form.controls.lookup.disable();
    hostFixture.detectChanges();
    hostFixture.componentInstance.lookup.returnFocus();
    const hostInput = hostFixture.nativeElement.querySelector('.search-input');
    hostInput.click();
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    hostFixture.detectChanges();
    const dropdownEl = hostFixture.nativeElement.querySelector('.lookup-list-container');
    expect(dropdownEl.offsetWidth).toBe(0);
    const hostIcon = hostFixture.nativeElement.querySelector('.search-go');
    hostIcon.click();
    hostFixture.detectChanges();
    expect(dropdownEl.offsetWidth).toBe(0);
    expect(hostFixture.nativeElement.querySelector('.search-input').disabled).toBeTruthy();
    expect(hostSearch).not.toHaveBeenCalled();
  }));

  it('should output html from formatter when provided', fakeAsync(() => {
    lookup.formatter = (item: SubstringHighlightedItem) => '<b>' + item.text + '</b>';
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '222';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const firstItem = fixture.nativeElement.querySelector('.lookup-item .item-container');
    expect(firstItem.innerHTML).toBe('<b>2222</b>');
    firstItem.click();
    doubleTick(fixture);
    expect(input.value).toBe('2222');
  }));

  it('should escape items html when escapeHtml flag is set ative', fakeAsync(() => {
    component.list = [{id: 1, text: '<b>1111</b>'}, {id: 2, text: '1122'}, {id: 3, text: '1133'}];
    lookup.escapeHtml = true;
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const firstItem = fixture.nativeElement.querySelector('.lookup-item .item-container');
    expect(firstItem.textContent).toBe('<b>1111</b>');
    const firstItemSelection = fixture.nativeElement.querySelector('.lookup-item .highlight-part');
    expect(firstItemSelection.textContent).toBe('11');
    firstItem.click();
    doubleTick(fixture);
    expect(input.value).toBe('<b>1111</b>');
  }));

  it('should escape items with escapeHtml without highlighting substring', fakeAsync(() => {
    component.list = [{id: 1, text: '<b>1111</b>'}, {id: 2, text: '1122'}, {id: 3, text: '1133'}];
    lookup.escapeHtml = true;
    lookup.highlightSubstring = false;
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = '11';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    const firstItem = fixture.nativeElement.querySelector('.lookup-item .item-container');
    expect(firstItem.textContent).toBe('<b>1111</b>');
    const anyItemSelection = fixture.nativeElement.querySelector('.lookup-item .highlight-part');
    expect(anyItemSelection).toBeNull();
    firstItem.click();
    doubleTick(fixture);
    expect(input.value).toBe('<b>1111</b>');
  }));

  it('should highlight the item if mouse is over it', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    expect(dropdown.offsetWidth).not.toBe(0);
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
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
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
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
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[2].dispatchEvent(TestEvents.mouseenter());
    fixture.detectChanges();
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelectorAll('.lookup-item.highlighted');
    expect(highlighted.length).toBe(1);
  }));

  it('should correctly handle tail elements when navigating with keyboard', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    TestEvents.arrowUp(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[2].classList.contains('highlighted')).toBeTruthy();
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
  }));

  it('should scroll to navigated element when navigating with keyboard', fakeAsync(() => {
    component.list = [{id: 1, text: 'aaa'}, {id: 2, text: 'aab'}, {id: 3, text: 'aac'}, {id: 4, text: 'aad'},
        {id: 5, text: 'aae'}, {id: 6, text: 'aaf'}, {id: 7, text: 'aag'}, {id: 8, text: 'aah'},
        {id: 9, text: 'aai'}, {id: 10, text: 'aaj'}, {id: 11, text: 'aak'}];
    fixture.detectChanges();
    lookup.returnFocus();
    input.value = 'aa';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    fixture.detectChanges();
    const items: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.lookup-item'));
    const scrollArea = fixture.nativeElement.querySelector('.lookup-list-container .ps');
    expect(TestHelper.isVisibleInsideScrollViewport(items[9], scrollArea)).toBeFalsy();
    for (let i = 0; i < 9; i++) {
      TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    }
    expect(TestHelper.isVisibleInsideScrollViewport(items[9], scrollArea)).toBeTruthy();
  }));

  it('should let select particular item after keyboard navigation with enter', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.lookup-item');
    TestEvents.arrowDown(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(items[0].classList.contains('highlighted')).toBeTruthy();
    TestEvents.enter(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    tick();
    expect(fixture.nativeElement.querySelector('.lookup-list-container').offsetWidth).toBe(0);
    expect(component.value.id).toBe(2);
  }));

  it('should close dropdown by Esc and open it back by Enter', fakeAsync(() => {
    lookup.returnFocus();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    fixture.detectChanges();
    TestEvents.escape(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lookup-list-container').offsetWidth).toBe(0);
    TestEvents.enter(document.activeElement as HTMLInputElement);
    fixture.detectChanges();
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(fixture.nativeElement.querySelector('.lookup-list-container').offsetWidth).not.toBe(0);
  }));

  it('should mark as touched when first searching', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(FormControlComponent);
    doubleTick(hostFixture);
    expect(hostFixture.componentInstance.form.controls.lookup.touched).toBeFalsy();
    TestEvents.makeTouched(hostFixture.nativeElement.querySelector('.search-input'));
    tick(SCROLLBAR_UPDATE_TIMING);
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.form.controls.lookup.touched).toBeTruthy();
  }));

  it('should have invalid class when invalid', fakeAsync(() => {
    expect(input.classList.contains('invalid')).toBeFalsy();
    lookup.invalid = true;
    lookup.validationShowOn = 'immediate';
    lookup.check();
    doubleTick(fixture);
    expect(input.classList.contains('invalid')).toBeTruthy();
    TestEvents.focus(input);
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
    expect(input.classList.contains('invalid')).toBeTruthy();
  }));

  it('should hide magnifying glass icon when showMagnifyingGlass is deactivated', fakeAsync(() => {
    expect(icon.offsetWidth).not.toBe(0);
    lookup.showMagnifyingGlass = false;
    fixture.detectChanges();
    expect(icon.offsetWidth).toBe(0);
  }));

  it('should let transparently pass mouse events through', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    doubleTick(hostFixture);
    field = hostFixture.nativeElement.querySelector('.search-field') as HTMLElement;
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
    doubleTick(hostFixture);
    input = hostFixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    field = hostFixture.nativeElement.querySelector('.search-field') as HTMLElement;
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
    field.dispatchEvent(TestEvents.touchstart());
    expect(touchstartListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.touchend());
    expect(touchendListener).toHaveBeenCalled();
    field.dispatchEvent(TestEvents.touchmove());
    expect(touchmoveListener).toHaveBeenCalled();
  }));

  it('should emit focus, blur, input events as usual input', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(EventTestComponent);
    doubleTick(hostFixture);
    const hostInput = hostFixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const eventHost = hostFixture.componentInstance;
    const focusListener = spyOn(eventHost, 'focus').and.callThrough();
    const blurListener = spyOn(eventHost, 'blur').and.callThrough();
    const inputListener = spyOn(eventHost, 'input').and.callThrough();
    hostInput.dispatchEvent(new Event('focus'));
    expect(focusListener).toHaveBeenCalledTimes(1);
    hostInput.dispatchEvent(new Event('blur'));
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
    expect(blurListener).toHaveBeenCalledTimes(1);
    hostInput.dispatchEvent(TestEvents.input());
    expect(inputListener).toHaveBeenCalledTimes(1);
    tick(DEFAULT_QUERY_DEBOUNCE);
    tick(SCROLLBAR_UPDATE_TIMING);
  }));

  it('should emit change event when selection changed, but not programmatically', fakeAsync(() => {
    const changeListener = spyOn(component, 'onChange').and.callThrough();
    component.value = shortList[2];
    doubleTick(fixture);
    expect(changeListener).not.toHaveBeenCalled();
    lookup.returnFocus();
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    let items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[0].click();
    doubleTick(fixture);
    expect(changeListener).not.toHaveBeenCalled();
    input.value = '22';
    input.dispatchEvent(TestEvents.input());
    waitOpening(fixture);
    items = fixture.nativeElement.querySelectorAll('.lookup-item');
    items[0].click();
    doubleTick(fixture);
    expect(changeListener).toHaveBeenCalled();
  }));
});

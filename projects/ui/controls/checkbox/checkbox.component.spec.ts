import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

@Component({
  template: `
    <lib-checkbox [labelText]="text" [checkboxId]="id" [checked]="checked" [disabled]="disabled" [(ngModel)]="name"></lib-checkbox>
  `
})
export class TestCheckboxComponent {
  public name = false;
  public text = 'labelText';
  public id = 'unique_id';
  public disabled = false;
  public checked = false;
}

describe('CheckboxComponent', () => {
  let parentComponent: CheckboxComponent;
  let fixture: ComponentFixture<TestCheckboxComponent>;
  let component: TestCheckboxComponent;
  let inputElement: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCheckboxComponent, CheckboxComponent ],
      imports: [ FormsModule ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    parentComponent = TestBed.createComponent(CheckboxComponent).componentInstance;
    fixture = TestBed.createComponent(TestCheckboxComponent);
    component = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  it('CheckboxComponent should create', () => {
    expect(parentComponent).toBeTruthy();
  });

  it('TestCheckboxComponent should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should change value passed as @Input()', () => {
    const testCases = [{
      inputName: 'id', initialValue: 'unique-id', newValue: 'new-unique-id'
    }, {
      inputName: 'checked', initialValue: false, newValue: true
    }, {
      inputName: 'disabled', initialValue: false, newValue: true
    }];

    testCases.map(tc => {
      it(`for '${tc.inputName}' property`, fakeAsync(() => {
        const { inputName, initialValue, newValue } = tc;

        component[inputName] = newValue;
        tick();
        fixture.detectChanges();

        expect(inputElement[inputName]).toEqual(newValue);
      }));
    });
  });

  it('should change attribute passed as @Input()', fakeAsync(() => {
    component.text = 'newLabelText';
    tick();
    fixture.detectChanges();
    fixture.detectChanges();

    expect(inputElement.getAttribute('labelText')).toEqual('newLabelText');
  }));

  it('should change via ngModel from model', fakeAsync(() => {
    const newName = true;

    component.name = newName;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(inputElement.checked).toEqual(newName);
  }));

  it('should change via ngModel from view', fakeAsync(() => {
    const newName = true;

    inputElement.checked = newName;
    inputElement.dispatchEvent(new Event('change'));

    expect(component.name).toEqual(newName);
  }));
});

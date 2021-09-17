import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './button.component';
import { LoaderComponent } from '../loader/loader.component';
import { By } from '@angular/platform-browser';

@Component({
  template: ''
})
class TestButtonComponent {
  public event: boolean;
}

function createHostComponent(template: string): ComponentFixture<TestButtonComponent> {
  TestBed.overrideComponent(TestButtonComponent, { set: { template } });
  const fixture = TestBed.createComponent(TestButtonComponent);
  fixture.detectChanges();
  return fixture as ComponentFixture<TestButtonComponent>;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule ],
      declarations: [ ButtonComponent, TestButtonComponent, LoaderComponent ]
    });
  });

  it('should have anchor with href when type = anchor', () => {
    fixture = createHostComponent('<lib-button type="anchor" link="http://example.com/">anchor</lib-button>');
    fixture.detectChanges();

    const anchorElement = fixture.debugElement.query(By.css('a'));
    expect(anchorElement).toBeTruthy();
    expect(anchorElement.nativeElement.href).toEqual('http://example.com/');
  });

  it('should emit on click', () => {
    fixture = createHostComponent('<lib-button (click)="event = true;">should emit on click</lib-button>');
    fixture.componentInstance.event = false;
    fixture.detectChanges();

    const buttonComponent = fixture.debugElement.query(By.directive(ButtonComponent)) as DebugElement;
    const buttonElement = buttonComponent.query(By.css('button')) as DebugElement;

    buttonElement.triggerEventHandler('click', { stopPropagation: () => {}});
    fixture.detectChanges();
    expect(fixture.componentInstance.event).toEqual(true);
  });

  it('should not emit on click when disabled', () => {
    fixture = createHostComponent('<lib-button (click)="event = true;" [disabled]="true">should not emit on click</lib-button>');
    fixture.componentInstance.event = undefined;
    fixture.detectChanges();

    const buttonComponent = fixture.debugElement.query(By.directive(ButtonComponent)) as DebugElement;
    const buttonElement = buttonComponent.query(By.css('button')) as DebugElement;

    buttonElement.triggerEventHandler('click', { stopPropagation: () => {}});
    fixture.detectChanges();
    expect(fixture.componentInstance.event).toEqual(undefined);
  });
});

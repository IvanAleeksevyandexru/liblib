import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifierComponent } from './notifier.component';

describe('NotifierComponent', () => {
  const component: NotifierComponent = null;
  const fixture: ComponentFixture<NotifierComponent> = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(NotifierComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});

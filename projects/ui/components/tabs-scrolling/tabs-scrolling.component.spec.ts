import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsScrollingComponent } from './tabs-scrolling.component';

describe('TabsScrollingComponent', () => {
  let component: TabsScrollingComponent;
  let fixture: ComponentFixture<TabsScrollingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsScrollingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsScrollingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

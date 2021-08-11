import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsLightComponent } from './tabs-light.component';

describe('TabsLightComponent', () => {
  let component: TabsLightComponent;
  let fixture: ComponentFixture<TabsLightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsLightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

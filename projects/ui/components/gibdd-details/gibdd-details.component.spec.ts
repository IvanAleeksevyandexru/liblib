import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GibddDetailsComponent } from './gibdd-details.component';

describe('GibddDetailsComponent', () => {
  let component: GibddDetailsComponent;
  let fixture: ComponentFixture<GibddDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GibddDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GibddDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

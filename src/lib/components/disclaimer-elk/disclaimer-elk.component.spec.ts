import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerElkComponent } from './disclaimer-elk.component';

describe('DisclaimerElkComponent', () => {
  let component: DisclaimerElkComponent;
  let fixture: ComponentFixture<DisclaimerElkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisclaimerElkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclaimerElkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

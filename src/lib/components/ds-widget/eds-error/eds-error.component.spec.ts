import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdsErrorComponent } from './eds-error.component';

describe('EdsErrorComponent', () => {
  let component: EdsErrorComponent;
  let fixture: ComponentFixture<EdsErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdsErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

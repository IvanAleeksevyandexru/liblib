import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdsItemComponent } from './eds-item.component';

describe('EdsItemComponent', () => {
  let component: EdsItemComponent;
  let fixture: ComponentFixture<EdsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdsItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

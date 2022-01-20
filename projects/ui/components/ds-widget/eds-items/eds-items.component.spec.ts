import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdsItemsComponent } from './eds-items.component';

describe('EdsItemsComponent', () => {
  let component: EdsItemsComponent;
  let fixture: ComponentFixture<EdsItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdsItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdsItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

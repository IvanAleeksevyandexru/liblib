import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdsPinComponent } from './eds-pin.component';

describe('PinModalComponent', () => {
  let component: EdsPinComponent;
  let fixture: ComponentFixture<EdsPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdsPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdsPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

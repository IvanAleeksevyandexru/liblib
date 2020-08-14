import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdsLoaderComponent } from './eds-loader.component';

describe('EdsLoaderComponent', () => {
  let component: EdsLoaderComponent;
  let fixture: ComponentFixture<EdsLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdsLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdsLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

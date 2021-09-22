import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderImagesModalComponent } from './slider-images-modal.component';

describe('SliderImagesModalComponent', () => {
  let component: SliderImagesModalComponent;
  let fixture: ComponentFixture<SliderImagesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderImagesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderImagesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

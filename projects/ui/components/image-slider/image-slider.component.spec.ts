import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageSliderComponent } from './image-slider.component';
import { SliderImage } from '../../models/slider-image';

const FakeImages: SliderImage[] = [
  {
    data: 'TEST_IMAGE_DATA_1',
    title: 'TEST_IMAGE_TITLE_1',
  } as SliderImage,
  {
    data: 'TEST_IMAGE_DATA_2',
    title: 'TEST_IMAGE_TITLE_2',
  } as SliderImage
];

describe('SliderBannerComponent', () => {
  let component: ImageSliderComponent;
  let fixture: ComponentFixture<ImageSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule ],
      declarations: [
        ImageSliderComponent,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return zero images length if images array is invalid', () => {
    component.images = undefined;
    expect(component.imagesLength).toEqual(0);
  });

  it('should return zero images length if images array empty', () => {
    component.images = [];
    expect(component.imagesLength).toEqual(0);
  });

  it('should return valid images array length', () => {
    component.images = FakeImages;
    expect(component.imagesLength).toEqual(FakeImages.length);
  });

  it('should return valid dots count', () => {
    component.images = [...FakeImages, ...FakeImages, ...FakeImages];
    component.limit = 3;
    expect(component.dots.length).toEqual(4);
  });

  it('should return true controls visible flag if dots not empty', () => {
    component.images = [...FakeImages, ...FakeImages, ...FakeImages];
    component.limit = 3;
    expect(component.controlsVisible).toEqual(true);
  });

  it('should return false controls visible flag if are no dots', () => {
    component.images = FakeImages;
    component.limit = 3;
    expect(component.controlsVisible).toEqual(false);
  });
});

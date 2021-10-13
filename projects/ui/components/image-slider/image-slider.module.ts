import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSliderComponent } from './image-slider.component';
import { SliderImagesModalComponent } from './slider-images-modal/slider-images-modal.component';
import { SliderComponent } from './slider/slider.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ImageSliderComponent,
    SliderImagesModalComponent,
    SliderComponent
  ],
  exports: [
    ImageSliderComponent,
    SliderComponent,
    SliderImagesModalComponent
  ],
  entryComponents: [
    SliderImagesModalComponent
  ],
})
export class ImageSliderModule {
}

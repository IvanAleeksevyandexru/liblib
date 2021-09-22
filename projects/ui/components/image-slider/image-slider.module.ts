import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSliderComponent } from './image-slider.component';
import { SliderImagesModalComponent } from './slider-images-modal/slider-images-modal.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ImageSliderComponent,
    SliderImagesModalComponent
  ],
  exports: [ImageSliderComponent,
    SliderImagesModalComponent
  ],
  entryComponents: [
    SliderImagesModalComponent
  ],
})
export class ImageSliderModule {
}

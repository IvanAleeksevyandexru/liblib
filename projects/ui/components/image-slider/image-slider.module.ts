import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSliderComponent } from './image-slider.component';
import { SliderImagesModalComponent } from './slider-images-modal/slider-images-modal.component';
import { ImageSlidesComponent } from './image-slides/image-slides.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ImageSliderComponent,
    SliderImagesModalComponent,
    ImageSlidesComponent
  ],
  exports: [
    ImageSliderComponent,
    ImageSlidesComponent,
    SliderImagesModalComponent
  ],
  entryComponents: [
    SliderImagesModalComponent
  ],
})
export class ImageSliderModule {
}

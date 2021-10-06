import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderBannerComponent } from './banner-slider.component';
import { BannerStaticModule } from '@epgu/ui/components/banner-static';

@NgModule({
  imports: [
    CommonModule,
    BannerStaticModule,
  ],
  declarations: [
    SliderBannerComponent
  ],
  exports: [SliderBannerComponent],
})
export class BannerSliderModule {
}

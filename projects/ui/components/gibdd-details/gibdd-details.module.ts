import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GibddDetailsComponent } from './gibdd-details.component';
import { ToMoneyModule, TranslateModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';
import { ImageSliderModule } from '@epgu/ui/components/image-slider';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ImageSliderModule,
    ToMoneyModule,
    BaseModule
  ],
  declarations: [
    GibddDetailsComponent
  ],
  exports: [GibddDetailsComponent],
})
export class GibddDetailsModule {
}

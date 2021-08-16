import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GibddDetailsComponent } from './gibdd-details.component';
import { ToMoneyModule, TranslateModule } from '@epgu/ui/pipes';
import { ThrobberModule, MapModule } from '@epgu/ui/base';
import { ButtonModule } from '@epgu/ui/base';
import { ImageSliderModule } from '@epgu/ui/components/image-slider';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ThrobberModule,
    MapModule,
    ImageSliderModule,
    ToMoneyModule,
    ButtonModule
  ],
  declarations: [
    GibddDetailsComponent
  ],
  exports: [GibddDetailsComponent],
})
export class GibddDetailsModule {
}

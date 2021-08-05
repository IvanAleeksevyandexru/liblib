import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GibddDetailsComponent } from './gibdd-details.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ToMoneyModule } from '../../pipes/to-money/to-money.module';
import { ThrobberModule } from '../throbber/throbber.module';
import { MapModule } from '../map/map.module';
import { ButtonModule } from 'epgu-lib/lib/components/button';
import { ImageSliderModule } from '../image-slider/image-slider.module';


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

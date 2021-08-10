import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { RadioModule } from '../radio/radio.module';
import { ButtonModule } from '../button/button.module';
import { LookupModule } from  '../lookup/lookup.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RadioModule,
    ButtonModule,
    LookupModule,
    FormsModule,
  ],
  declarations: [
    LocationComponent
  ],
  exports: [
    LocationComponent
  ],
  entryComponents: [
    LocationComponent
  ]
})
export class LocationModule {
}

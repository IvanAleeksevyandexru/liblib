import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { RadioModule } from '@epgu/epgu-lib/lib/components/radio';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';
import { LookupModule } from  '@epgu/epgu-lib/lib/components/lookup';
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

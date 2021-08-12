import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { RadioModule } from '@epgu/ui/components/radio';
import { ButtonModule } from '@epgu/ui/components/button';
import { LookupModule } from '@epgu/ui/components/lookup';
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

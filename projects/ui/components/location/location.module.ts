import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { RadioModule } from '@epgu/ui/controls';
import { ButtonModule } from '@epgu/ui/base';
import { LookupModule } from '@epgu/ui/controls';
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

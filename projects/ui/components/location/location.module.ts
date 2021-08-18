import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { ControlsModule } from '@epgu/ui/controls';
import { BaseModule } from '@epgu/ui/base';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ControlsModule,
    BaseModule,
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectComponent } from './location-select.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule
  ],
  declarations: [
    LocationSelectComponent
  ],
  exports: [
    LocationSelectComponent
  ],
})
export class LocationSelectModule {
}

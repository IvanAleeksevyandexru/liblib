import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectComponent } from './location-select.component';


@NgModule({
  imports: [
    CommonModule,
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

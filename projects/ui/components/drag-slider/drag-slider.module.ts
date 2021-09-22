import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragSliderComponent } from './drag-slider.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DragSliderComponent
  ],
  exports: [
    DragSliderComponent
  ],
})
export class DragSliderModule { }

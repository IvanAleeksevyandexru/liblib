import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameComponent } from './frame.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FrameComponent
  ],
  exports: [ FrameComponent ],
})
export class FrameModule { }

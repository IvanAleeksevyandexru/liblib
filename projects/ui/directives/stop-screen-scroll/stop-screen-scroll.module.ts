import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopScreenScrollDirective } from './stop-screen-scroll.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    StopScreenScrollDirective
  ],
  exports: [ StopScreenScrollDirective ],
})
export class StopScreenScrollModule { }

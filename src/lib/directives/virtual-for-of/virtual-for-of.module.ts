import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualForOfDirective } from './virtual-for-of.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    VirtualForOfDirective
  ],
  exports: [ VirtualForOfDirective ],
})
export class VirtualForOfModule { }

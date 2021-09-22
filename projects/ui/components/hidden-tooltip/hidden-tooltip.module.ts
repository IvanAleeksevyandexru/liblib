import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HiddenTooltipComponent } from './hidden-tooltip.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    HiddenTooltipComponent
  ],
  exports: [ HiddenTooltipComponent ],
})
export class HiddenTooltipModule { }

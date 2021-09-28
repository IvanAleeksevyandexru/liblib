import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerElkComponent } from './disclaimer-elk.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DisclaimerElkComponent
  ],
  exports: [ DisclaimerElkComponent ],
})
export class DisclaimerElkModule { }

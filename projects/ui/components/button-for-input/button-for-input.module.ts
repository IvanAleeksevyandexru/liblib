import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonForInputComponent } from './button-for-input.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ButtonForInputComponent
  ],
  exports: [ ButtonForInputComponent ],
})
export class ButtonForInputModule { }

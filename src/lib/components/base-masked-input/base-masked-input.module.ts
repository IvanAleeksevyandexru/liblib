import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseMaskedInputComponent } from './base-masked-input.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BaseMaskedInputComponent
  ],
  exports: [ BaseMaskedInputComponent ],
})
export class BaseMaskedInputModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseMaskedInputComponent } from './base-masked-input.component';
import { TranslateModule } from '../../pipes/translate/translate.module';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule
    ],
  declarations: [
    BaseMaskedInputComponent
  ],
  exports: [ BaseMaskedInputComponent ],
})
export class BaseMaskedInputModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { PlainInputComponent } from './plain-input.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    PlainInputComponent
  ],
  exports: [ PlainInputComponent ],
})
export class PlainInputModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthPickerComponent } from './month-picker.component';
import { TextMaskModule } from 'angular2-text-mask';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '../../pipes/translate/translate.module';


@NgModule({
  imports: [
    CommonModule,
    TextMaskModule,
    FormsModule,
    TranslateModule
  ],
  declarations: [
    MonthPickerComponent
  ],
  exports: [
    MonthPickerComponent
  ],
})

export class MonthPickerModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker.component';
import { ValidationMessageModule } from '../validation-message/validation-message.module';
import { StandardMaskedInputModule } from '../standard-masked-input/standard-masked-input.module';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { MonthYearSelectModule } from '../month-year-select/month-year-select.module';

@NgModule({
    imports: [
        CommonModule,
        ValidationMessageModule,
        StandardMaskedInputModule,
        FormsModule,
        ClickOutsideModule,
        TranslateModule,
        MonthYearSelectModule,
    ],
  declarations: [
    DatePickerComponent
  ],
  exports: [ DatePickerComponent ],
})
export class DatePickerModule { }

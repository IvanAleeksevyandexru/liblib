import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker.component';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { StandardMaskedInputModule } from '../standard-masked-input';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { TranslateModule } from '@epgu/ui/pipes';
import { MonthYearSelectModule } from '../month-year-select';

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
  exports: [DatePickerComponent],
})
export class DatePickerModule {
}

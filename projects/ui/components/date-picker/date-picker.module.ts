import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker.component';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { StandardMaskedInputModule } from '@epgu/ui/components/standard-masked-input';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { MonthYearSelectModule } from '@epgu/ui/components/month-year-select';

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

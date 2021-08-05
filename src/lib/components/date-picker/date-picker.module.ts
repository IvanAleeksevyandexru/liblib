import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker.component';
import { ValidationMessageModule } from 'epgu-lib/lib/components/validation-message';
import { StandardMaskedInputModule } from 'epgu-lib/lib/components/standard-masked-input';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { MonthYearSelectModule } from 'epgu-lib/lib/components/month-year-select';

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

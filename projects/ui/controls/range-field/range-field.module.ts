import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeFieldComponent } from './range-field.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { DatePickerModule } from '../date-picker';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@epgu/ui/pipes';
import { StopClickPropagationModule } from '@epgu/ui/directives';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    DatePickerModule,
    FormsModule,
    TranslateModule,
    StopClickPropagationModule
  ],
  declarations: [
    RangeFieldComponent
  ],
  exports: [RangeFieldComponent],
})
export class RangeFieldModule {
}

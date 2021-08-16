import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeSelectorComponent } from './range-selector.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { SafeHtmlModule, TranslateModule } from '@epgu/ui/pipes';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DatePickerModule } from '../date-picker';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    TranslateModule,
    SafeHtmlModule,
    PerfectScrollbarModule,
    DatePickerModule,
    FormsModule,
  ],
  declarations: [
    RangeSelectorComponent
  ],
  exports: [
    RangeSelectorComponent
  ],
})
export class RangeSelectorModule {
}

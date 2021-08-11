import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthYearSelectComponent } from './month-year-select.component';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    TranslateModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    MonthYearSelectComponent
  ],
  exports: [
    MonthYearSelectComponent
  ],
})

export class MonthYearSelectModule {
}

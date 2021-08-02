import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthYearSelectComponent } from './month-year-select.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
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

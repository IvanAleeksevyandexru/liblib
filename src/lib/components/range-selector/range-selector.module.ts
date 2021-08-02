import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeSelectorComponent } from './range-selector.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DatePickerModule } from '../date-picker/date-picker.module';
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

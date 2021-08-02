import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeFieldComponent } from './range-field.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { DatePickerModule } from '../date-picker/date-picker.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { StopClickPropagationModule } from '../../directives/stop-click-propagation/stop-click-propagation.module';


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

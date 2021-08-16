import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedMessageModule, TranslateModule } from '@epgu/ui/pipes';
import { ValidationMessageComponent } from './validation-message.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PipedMessageModule
  ],
  declarations: [
    ValidationMessageComponent
  ],
  exports: [ValidationMessageComponent],
})
export class ValidationMessageModule {
}

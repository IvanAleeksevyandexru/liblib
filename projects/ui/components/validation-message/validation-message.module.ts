import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedMessageModule, TranslatePipeModule } from '@epgu/ui/pipes';
import { ValidationMessageComponent } from './validation-message.component';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    PipedMessageModule
  ],
  declarations: [
    ValidationMessageComponent
  ],
  exports: [ValidationMessageComponent],
})
export class ValidationMessageModule {
}

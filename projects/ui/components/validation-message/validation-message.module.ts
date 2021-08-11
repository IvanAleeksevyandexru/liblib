import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedMessageModule } from '@epgu/ui/pipes/piped-message';
import { ValidationMessageComponent } from './validation-message.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PipedMessageModule
  ],
  declarations: [
    ValidationMessageComponent
  ],
  exports: [ ValidationMessageComponent ],
})
export class ValidationMessageModule { }

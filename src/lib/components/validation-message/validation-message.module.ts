import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedMessageModule } from '../../pipes/piped-message/piped-message.module';
import { ValidationMessageComponent } from './validation-message.component';
import { TranslateModule } from '../../pipes/translate/translate.module';


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

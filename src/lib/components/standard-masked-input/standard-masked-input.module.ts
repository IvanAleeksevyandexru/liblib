import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '../validation-message/validation-message.module';
import { InvalidResultsTipModule } from '../invalid-results-tip/invalid-results-tip.module';
import { QuestionHelpTipModule } from '../question-help-tip/question-help-tip.module';
import { BaseMaskedInputModule } from '../base-masked-input/base-masked-input.module';
import { StandardMaskedInputComponent } from './standard-masked-input.component';


@NgModule({
  imports: [
    CommonModule,
    ValidationMessageModule,
    InvalidResultsTipModule,
    QuestionHelpTipModule,
    BaseMaskedInputModule
  ],
  declarations: [
    StandardMaskedInputComponent
  ],
  exports: [ StandardMaskedInputComponent ],
})
export class StandardMaskedInputModule { }

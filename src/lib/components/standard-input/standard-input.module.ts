import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from 'epgu-lib/lib/components/validation-message';
import { InvalidResultsTipModule } from '../invalid-results-tip/invalid-results-tip.module';
import { PlainInputModule } from '../plain-input/plain-input.module';
import { QuestionHelpTipModule } from '../question-help-tip/question-help-tip.module';
import { StandardInputComponent } from './standard-input.component';


@NgModule({
  imports: [
    CommonModule,
    ValidationMessageModule,
    InvalidResultsTipModule,
    PlainInputModule,
    QuestionHelpTipModule
  ],
  declarations: [
    StandardInputComponent
  ],
  exports: [ StandardInputComponent ],
})
export class StandardInputModule { }

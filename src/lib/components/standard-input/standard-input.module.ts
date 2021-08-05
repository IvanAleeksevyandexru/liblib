import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from 'epgu-lib/lib/components/validation-message';
import { InvalidResultsTipModule } from 'epgu-lib/lib/components/invalid-results-tip';
import { PlainInputModule } from '../plain-input/plain-input.module';
import { QuestionHelpTipModule } from 'epgu-lib/lib/components/question-help-tip';
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

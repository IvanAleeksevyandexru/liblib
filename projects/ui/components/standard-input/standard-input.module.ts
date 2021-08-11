import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { InvalidResultsTipModule } from '@epgu/ui/components/invalid-results-tip';
import { PlainInputModule } from '@epgu/ui/components/plain-input';
import { QuestionHelpTipModule } from '@epgu/ui/components/question-help-tip';
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

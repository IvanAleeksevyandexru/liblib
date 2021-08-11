import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { InvalidResultsTipModule } from '@epgu/ui/components/invalid-results-tip';
import { QuestionHelpTipModule } from '@epgu/ui/components/question-help-tip';
import { StandardMaskedInputComponent } from './standard-masked-input.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { BaseMaskedInputModule } from '@epgu/ui/components/base-masked-input';


@NgModule({
    imports: [
        CommonModule,
        ValidationMessageModule,
        InvalidResultsTipModule,
        QuestionHelpTipModule,
        BaseMaskedInputModule,
        TranslateModule
    ],
  declarations: [
    StandardMaskedInputComponent
  ],
  exports: [ StandardMaskedInputComponent ],
})
export class StandardMaskedInputModule { }

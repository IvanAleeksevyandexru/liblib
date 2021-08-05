import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '@epgu/epgu-lib/lib/components/validation-message';
import { InvalidResultsTipModule } from '@epgu/epgu-lib/lib/components/invalid-results-tip';
import { QuestionHelpTipModule } from '@epgu/epgu-lib/lib/components/question-help-tip';
import { StandardMaskedInputComponent } from './standard-masked-input.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { BaseMaskedInputModule } from '@epgu/epgu-lib/lib/components/base-masked-input';


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

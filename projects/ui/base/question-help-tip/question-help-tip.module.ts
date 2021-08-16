import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedMessageModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
import { QuestionHelpTipComponent } from './question-help-tip.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PipedMessageModule,
    StopClickPropagationModule,
    ClickOutsideModule
  ],
  declarations: [
    QuestionHelpTipComponent
  ],
  exports: [QuestionHelpTipComponent],
})
export class QuestionHelpTipModule {
}

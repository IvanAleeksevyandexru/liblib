import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { PipedMessageModule } from '@epgu/ui/pipes/piped-message';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { QuestionHelpTipComponent } from './question-help-tip.component';
import { StopClickPropagationModule } from '@epgu/ui/directives/stop-click-propagation';

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
  exports: [ QuestionHelpTipComponent ],
})
export class QuestionHelpTipModule { }

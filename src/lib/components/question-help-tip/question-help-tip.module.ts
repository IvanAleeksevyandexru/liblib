import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { PipedMessageModule } from '../../pipes/piped-message/piped-message.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { QuestionHelpTipComponent } from './question-help-tip.component';
import { StopClickPropagationModule } from '../../directives/stop-click-propagation/stop-click-propagation.module';

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

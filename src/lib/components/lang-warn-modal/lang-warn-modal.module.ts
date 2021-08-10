import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangWarnModalComponent } from './lang-warn-modal.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
  ],
  declarations: [
    LangWarnModalComponent
  ],
  exports: [LangWarnModalComponent],
  entryComponents: [
    LangWarnModalComponent
  ]
})
export class LangWarnModalModule {
}

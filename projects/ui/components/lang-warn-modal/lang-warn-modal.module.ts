import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangWarnModalComponent } from './lang-warn-modal.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { ButtonModule } from '@epgu/ui/base';


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

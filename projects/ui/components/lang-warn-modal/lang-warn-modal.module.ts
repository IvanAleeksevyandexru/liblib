import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangWarnModalComponent } from './lang-warn-modal.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BaseModule,
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

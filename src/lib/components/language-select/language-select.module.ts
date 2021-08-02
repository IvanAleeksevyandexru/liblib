import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageSelectComponent } from './language-select.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ClickOutsideModule,
  ],
  declarations: [
    LanguageSelectComponent
  ],
  exports: [
    LanguageSelectComponent
  ],
})
export class LanguageSelectModule {
}

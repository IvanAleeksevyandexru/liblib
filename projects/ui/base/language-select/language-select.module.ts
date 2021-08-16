import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageSelectComponent } from './language-select.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule } from '@epgu/ui/directives';


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

import { NgModule } from '@angular/core';
import { AppTranslatePipe, LibTranslatePipe } from './translate.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppTranslatePipe,
    LibTranslatePipe
  ],
  exports: [
    AppTranslatePipe,
    LibTranslatePipe
  ]
})
export class TranslateModule {
}

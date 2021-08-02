import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorPageComponent } from './error-page.component';
import { TranslateModule } from '../../pipes/translate/translate.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    ErrorPageComponent
  ],
  exports: [ErrorPageComponent],
})
export class ErrorPageModule {
}

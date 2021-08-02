import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';
import { ButtonModule } from '../button/button.module';
import { TranslateModule } from '../../pipes/translate/translate.module';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
  ],
  declarations: [
    BackButtonComponent
  ],
  exports: [BackButtonComponent],
})
export class BackButtonModule {
}

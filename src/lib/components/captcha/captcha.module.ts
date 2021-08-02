import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaComponent } from './captcha.component';
import { TranslateModule } from '../../pipes/translate/translate.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    CaptchaComponent
  ],
  exports: [ CaptchaComponent ],
})
export class CaptchaModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaComponent } from './captcha.component';
import { TranslateModule } from '@epgu/ui/pipes';

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

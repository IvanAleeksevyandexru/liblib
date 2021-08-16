import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';
import { ButtonModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';

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

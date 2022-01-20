import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';
import { BaseModule } from '@epgu/ui/base';
import { TranslatePipeModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    TranslatePipeModule,
  ],
  declarations: [
    BackButtonComponent
  ],
  exports: [BackButtonComponent],
})
export class BackButtonModule {
}

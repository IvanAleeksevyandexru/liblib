import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsItemComponent } from './eds-item.component';
import { TranslateModule } from '../../../pipes/translate/translate.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    EdsItemComponent
  ],
  exports: [EdsItemComponent],
})
export class EdsItemModule {
}

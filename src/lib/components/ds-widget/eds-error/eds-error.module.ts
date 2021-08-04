import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsErrorComponent } from './eds-error.component';
import { TranslateModule } from '../../../pipes/translate/translate.module';
import { ButtonModule } from '../../button/button.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
  ],
  declarations: [
    EdsErrorComponent
  ],
  exports: [EdsErrorComponent],
  entryComponents: [EdsErrorComponent],
})
export class EdsErrorModule {
}

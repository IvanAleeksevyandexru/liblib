import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformerComponent } from './informer.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule
  ],
  declarations: [
    InformerComponent,
  ],
  exports: [
    InformerComponent,
  ],
})
export class InformerModule {
}

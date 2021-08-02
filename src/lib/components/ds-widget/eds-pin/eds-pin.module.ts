import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../../pipes/translate/translate.module';
import { EdsPinComponent } from './eds-pin.component';
import { EdsItemModule } from '../eds-item/eds-item.module';
import { StandardInputModule } from '../../standard-input/standard-input.module';
import { ButtonModule } from '../../button/button.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    EdsItemModule,
    StandardInputModule,
    ButtonModule,
    FormsModule,
  ],
  declarations: [
    EdsPinComponent
  ],
  exports: [EdsPinComponent],
})
export class EdsPinModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressSaveModalComponent } from './address-save-modal.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
  ],
  declarations: [
    AddressSaveModalComponent
  ],
  exports: [
    AddressSaveModalComponent
  ],
  entryComponents: [
    AddressSaveModalComponent
  ]
})
export class AddressSaveModalModule { }

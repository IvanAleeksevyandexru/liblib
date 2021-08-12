import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressSaveModalComponent } from './address-save-modal.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { ButtonModule } from '@epgu/ui/components/button';

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

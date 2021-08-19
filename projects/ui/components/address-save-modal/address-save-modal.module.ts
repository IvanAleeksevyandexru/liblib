import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressSaveModalComponent } from './address-save-modal.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    BaseModule
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

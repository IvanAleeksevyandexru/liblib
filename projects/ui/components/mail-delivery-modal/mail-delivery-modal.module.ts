import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailDeliveryModalComponent } from './mail-delivery-modal.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { ControlsModule } from '@epgu/ui/controls';
import { BaseModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    ControlsModule,
    TranslatePipeModule,
    BaseModule
  ],
  declarations: [
    MailDeliveryModalComponent
  ],
  exports: [MailDeliveryModalComponent],
  entryComponents: [MailDeliveryModalComponent]
})
export class MailDeliveryModalModule {
}

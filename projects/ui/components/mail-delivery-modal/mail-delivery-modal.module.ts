import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailDeliveryModalComponent } from './mail-delivery-modal.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    MailDeliveryModalComponent
  ],
  exports: [MailDeliveryModalComponent],
})
export class MailDeliveryModalModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { EdsItemsComponent } from './eds-items.component';
import { EdsItemModule } from '@epgu/ui/components/ds-widget/eds-item';
import { PagingControlsModule } from '@epgu/ui/components/paging-controls';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    EdsItemModule,
    PagingControlsModule,
  ],
  declarations: [
    EdsItemsComponent
  ],
  exports: [EdsItemsComponent],
  entryComponents: [EdsItemsComponent],
})
export class EdsItemsModule {
}

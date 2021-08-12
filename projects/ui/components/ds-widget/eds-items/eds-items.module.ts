import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { EdsItemsComponent } from './eds-items.component';
import { EdsItemModule } from '@epgu/ui/components/ds-widget/eds-item';
import { PagingControlsModule } from '@epgu/ui/components/paging-controls';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
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

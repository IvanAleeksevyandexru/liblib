import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../../pipes/translate/translate.module';
import { EdsItemsComponent } from './eds-items.component';
import { EdsItemModule } from '../eds-item/eds-item.module';
import { PagingControlsModule } from 'epgu-lib/lib/components/paging-controls';


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

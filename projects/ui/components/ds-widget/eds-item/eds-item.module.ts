import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsItemComponent } from './eds-item.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
  ],
  declarations: [
    EdsItemComponent
  ],
  exports: [EdsItemComponent],
})
export class EdsItemModule {
}

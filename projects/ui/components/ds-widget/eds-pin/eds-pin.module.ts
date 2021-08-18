import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes';
import { EdsPinComponent } from './eds-pin.component';
import { EdsItemModule } from '@epgu/ui/components/ds-widget/eds-item';
import { StandardInputModule } from '@epgu/ui/controls';
import { BaseModule } from '@epgu/ui/base';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    EdsItemModule,
    StandardInputModule,
    BaseModule,
    FormsModule,
  ],
  declarations: [
    EdsPinComponent
  ],
  exports: [EdsPinComponent],
  entryComponents: [EdsPinComponent],
})
export class EdsPinModule {
}

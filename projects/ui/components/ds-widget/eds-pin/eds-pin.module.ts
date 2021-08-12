import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { EdsPinComponent } from './eds-pin.component';
import { EdsItemModule } from '@epgu/ui/components/ds-widget/eds-item';
import { StandardInputModule } from '@epgu/ui/components/standard-input';
import { ButtonModule } from '@epgu/ui/components/button';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    EdsItemModule,
    StandardInputModule,
    ButtonModule,
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

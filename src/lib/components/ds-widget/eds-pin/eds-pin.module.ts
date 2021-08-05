import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../../pipes/translate/translate.module';
import { EdsPinComponent } from './eds-pin.component';
import { EdsItemModule } from '../eds-item/eds-item.module';
import { StandardInputModule } from 'epgu-lib/lib/components/standard-input';
import { ButtonModule } from 'epgu-lib/lib/components/button';
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

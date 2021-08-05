import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataModalComponent } from './dadata-modal.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
  ],
  declarations: [
    DadataModalComponent
  ],
  exports: [ DadataModalComponent ],
  entryComponents: [ DadataModalComponent ],
})
export class DadataModalModule { }

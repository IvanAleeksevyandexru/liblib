import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataModalComponent } from './dadata-modal.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { ButtonModule } from '@epgu/ui/components/button';

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataModalComponent } from './dadata-modal.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BaseModule,
  ],
  declarations: [
    DadataModalComponent
  ],
  exports: [ DadataModalComponent ],
  entryComponents: [ DadataModalComponent ],
})
export class DadataModalModule { }

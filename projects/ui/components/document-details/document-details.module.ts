import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { DocumentDetailsComponent } from './document-details.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    DocumentDetailsComponent
  ],
  exports: [ DocumentDetailsComponent ],
})
export class DocumentDetailsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
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

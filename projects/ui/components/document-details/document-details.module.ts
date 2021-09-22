import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { DocumentDetailsComponent } from './document-details.component';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule
  ],
  declarations: [
    DocumentDetailsComponent
  ],
  exports: [ DocumentDetailsComponent ],
})
export class DocumentDetailsModule { }

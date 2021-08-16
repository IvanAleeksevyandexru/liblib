import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLookupComponent } from './multi-lookup.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { SubstModule } from '@epgu/ui/pipes';
import { SafeHtmlModule } from '@epgu/ui/pipes';
import { LookupModule } from '../lookup';
import { FormsModule } from '@angular/forms';
import { DeclineModule } from '@epgu/ui/pipes';


@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        SubstModule,
        SafeHtmlModule,
        LookupModule,
        FormsModule,
        DeclineModule,
    ],
  declarations: [
    MultiLookupComponent
  ],
  exports: [
    MultiLookupComponent
  ],
})

export class MultiLookupModule {
}

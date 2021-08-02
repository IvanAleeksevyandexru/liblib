import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLookupComponent } from './multi-lookup.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SubstModule } from '../../pipes/subst/subst.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { LookupModule } from '../lookup/lookup.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SubstModule,
    SafeHtmlModule,
    LookupModule,
    FormsModule,
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

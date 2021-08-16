import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SafeHtmlModule, SubstModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, VirtualForOfModule } from '@epgu/ui/directives';
import { SearchBarModule } from '../search-bar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { LoaderModule } from '@epgu/ui/base';
import { LookupComponent } from './lookup.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PerfectScrollbarModule,
    SafeHtmlModule,
    SubstModule,
    ClickOutsideModule,
    VirtualForOfModule,
    SearchBarModule,
    VirtualScrollModule,
    LoaderModule,
    TranslateModule
  ],
  declarations: [
    LookupComponent
  ],
  exports: [LookupComponent],
})
export class LookupModule {
}

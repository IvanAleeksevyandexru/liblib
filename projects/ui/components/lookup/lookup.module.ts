import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SafeHtmlModule } from '@epgu/ui/pipes/safe-html';
import { SubstModule } from '@epgu/ui/pipes/subst';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { VirtualForOfModule } from '@epgu/ui/directives/virtual-for-of';
import { SearchBarModule } from '@epgu/ui/components/search-bar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { LoaderModule } from '@epgu/ui/components/loader';
import { LookupComponent } from './lookup.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';


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
  exports: [ LookupComponent ],
})
export class LookupModule { }

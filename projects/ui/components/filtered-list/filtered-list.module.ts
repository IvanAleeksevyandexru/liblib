import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SubstModule } from '@epgu/ui/pipes/subst';
import { SafeHtmlModule } from '@epgu/ui/pipes/safe-html';
import { VirtualForOfModule } from '@epgu/ui/directives/virtual-for-of';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { FilteredListComponent } from './filtered-list.component';
import { SearchBarModule } from '@epgu/ui/components/search-bar';
import { TranslateModule } from '@epgu/ui/pipes/translate';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PerfectScrollbarModule,
        SubstModule,
        SafeHtmlModule,
        VirtualForOfModule,
        VirtualScrollModule,
        SearchBarModule,
        TranslateModule
    ],
  declarations: [
    FilteredListComponent
  ],
  exports: [ FilteredListComponent ],
})
export class FilteredListModule { }

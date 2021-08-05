import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SubstModule } from '../../pipes/subst/subst.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { VirtualForOfModule } from '../../directives/virtual-for-of/virtual-for-of.module';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { FilteredListComponent } from './filtered-list.component';
import { SearchBarModule } from '@epgu/epgu-lib/lib/components/search-bar';
import { TranslateModule } from '../../pipes/translate/translate.module';


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

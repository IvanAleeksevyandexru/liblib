import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SafeHtmlModule, SubstModule, TranslateModule } from '@epgu/ui/pipes';
import { VirtualForOfModule } from '@epgu/ui/directives';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { FilteredListComponent } from './filtered-list.component';
import { SearchBarModule } from '../search-bar';


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
  exports: [FilteredListComponent],
})
export class FilteredListModule {
}

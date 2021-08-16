import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SubstModule, TranslateModule } from '@epgu/ui/pipes';
import { SearchBarModule } from '../search-bar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { LoaderModule } from '@epgu/ui/base';
import { ClickOutsideModule, StopScreenScrollModule, VirtualForOfModule } from '@epgu/ui/directives';
import { AutocompleteComponent } from './autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PerfectScrollbarModule,
    TranslateModule,
    SearchBarModule,
    VirtualScrollModule,
    LoaderModule,
    StopScreenScrollModule,
    ClickOutsideModule,
    SubstModule,
    VirtualForOfModule
  ],
  declarations: [
    AutocompleteComponent
  ],
  exports: [AutocompleteComponent],
})
export class AutocompleteModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { ClickOutsideModule, StopScreenScrollModule, VirtualForOfModule } from '@epgu/ui/directives';
import { DeclineModule, SafeHtmlModule, SubstModule, TranslateModule } from '@epgu/ui/pipes';
import { SearchBarModule } from '../search-bar';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    SafeHtmlModule,
    TranslateModule,
    SubstModule,
    StopScreenScrollModule,
    SearchBarModule,
    FormsModule,
    PerfectScrollbarModule,
    VirtualScrollModule,
    DeclineModule,
    VirtualForOfModule,
  ],
  declarations: [
    DropdownComponent
  ],
  exports: [DropdownComponent],
})
export class DropdownModule {
}

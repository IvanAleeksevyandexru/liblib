import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { SearchBarModule } from '@epgu/ui/components/search-bar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { LoaderModule } from '@epgu/ui/components/loader';
import { StopScreenScrollModule } from '@epgu/ui/directives/stop-screen-scroll';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { SubstModule } from '@epgu/ui/pipes/subst';
import { VirtualForOfModule } from '@epgu/ui/directives/virtual-for-of';
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
  exports: [ AutocompleteComponent ],
})
export class AutocompleteModule { }

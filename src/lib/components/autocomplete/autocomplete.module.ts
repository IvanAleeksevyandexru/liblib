import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SearchBarModule } from '@epgu/epgu-lib/lib/components/search-bar';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { LoaderModule } from '@epgu/epgu-lib/lib/components/loader';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { SubstModule } from '../../pipes/subst/subst.module';
import { VirtualForOfModule } from '../../directives/virtual-for-of/virtual-for-of.module';
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

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { SubstModule } from '../../pipes/subst/subst.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { VirtualForOfModule } from '../../directives/virtual-for-of/virtual-for-of.module';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { LoaderModule } from '../loader/loader.module';
import { LookupComponent } from './lookup.component';
import { TranslateModule } from '../../pipes/translate/translate.module';


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

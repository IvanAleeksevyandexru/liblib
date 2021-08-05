import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SubstModule } from '../../pipes/subst/subst.module';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { SearchBarModule } from '@epgu/epgu-lib/lib/components/search-bar';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { DeclineModule } from '../../pipes/decline/decline.module';
import { VirtualForOfModule } from '../../directives/virtual-for-of/virtual-for-of.module';


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

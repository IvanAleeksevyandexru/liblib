import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { SafeHtmlModule } from '@epgu/ui/pipes/safe-html';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { SubstModule } from '@epgu/ui/pipes/subst';
import { StopScreenScrollModule } from '@epgu/ui/directives/stop-screen-scroll';
import { SearchBarModule } from '@epgu/ui/components/search-bar';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { DeclineModule } from '@epgu/ui/pipes/decline';
import { VirtualForOfModule } from '@epgu/ui/directives/virtual-for-of';


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

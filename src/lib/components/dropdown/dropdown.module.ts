import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SubstModule } from '../../pipes/subst/subst.module';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';


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
  ],
  declarations: [
    DropdownComponent
  ],
  exports: [DropdownComponent],
})
export class DropdownModule {
}

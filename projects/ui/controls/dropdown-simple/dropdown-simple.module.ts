import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SafeHtmlModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopScreenScrollModule } from '@epgu/ui/directives';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { DropdownSimpleComponent } from './dropdown-simple.component';


@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    TranslateModule,
    ClickOutsideModule,
    SafeHtmlModule,
    VirtualScrollModule,
    StopScreenScrollModule
  ],
  declarations: [
    DropdownSimpleComponent
  ],
  exports: [DropdownSimpleComponent],
})
export class DropdownSimpleModule {
}

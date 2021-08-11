import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { ClickOutsideModule } from '@epgu/ui/directives/click-outside';
import { SafeHtmlModule } from '@epgu/ui/pipes/safe-html';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { StopScreenScrollModule } from '@epgu/ui/directives/stop-screen-scroll';
import { DropdownSimpleComponent } from '../dropdown-simple/dropdown-simple.component';


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
  exports: [ DropdownSimpleComponent ],
})
export class DropdownSimpleModule { }

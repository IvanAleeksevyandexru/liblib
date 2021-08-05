import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { VirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { DropdownSimpleComponent } from 'epgu-lib/lib/components/dropdown-simple';


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

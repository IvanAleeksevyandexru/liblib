import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FeedsModule } from '../feeds/feeds.module';
import { LangWarnModalModule } from '../lang-warn-modal/lang-warn-modal.module';


@NgModule({
  imports: [
    CommonModule,
    StopScreenScrollModule,
    PerfectScrollbarModule,
    FeedsModule,
    LangWarnModalModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [HeaderComponent],
})
export class HeaderModule {
}

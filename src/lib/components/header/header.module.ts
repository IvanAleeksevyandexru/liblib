import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { StopScreenScrollModule } from '../../directives/stop-screen-scroll/stop-screen-scroll.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FeedsModule } from '../feeds/feeds.module';
import { LangWarnModalModule } from '../lang-warn-modal/lang-warn-modal.module';
import { LoginModule } from '../login/login.module';
import { UserMenuModule } from '../user-menu/user-menu.module';
import { MenuCatalogModule } from '../menu-catalog/menu-catalog.module';
import { MenuCatalogSimpleModule } from '../menu-catalog-simple/menu-catalog-simple.module';
import { LogoModule } from '../logo/logo.module';
import { LanguageSelectModule } from '../language-select/language-select.module';
import { LocationSelectModule } from '../location-select/location-select.module';


@NgModule({
  imports: [
    CommonModule,
    StopScreenScrollModule,
    PerfectScrollbarModule,
    FeedsModule,
    LangWarnModalModule,
    LoginModule,
    UserMenuModule,
    MenuCatalogModule,
    MenuCatalogSimpleModule,
    LogoModule,
    LanguageSelectModule,
    LocationSelectModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [HeaderComponent],
})
export class HeaderModule {
}

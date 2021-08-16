import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { StopScreenScrollModule } from '@epgu/ui/directives';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FeedsModule } from '@epgu/ui/components/feeds';
import { LangWarnModalModule } from '@epgu/ui/components/lang-warn-modal';
import { LoginModule } from '@epgu/ui/components/login';
import { UserMenuModule } from '@epgu/ui/components/user-menu';
import { MenuCatalogModule } from '@epgu/ui/components/menu-catalog';
import { MenuCatalogSimpleModule } from '@epgu/ui/components/menu-catalog-simple';
import { LanguageSelectModule, LogoModule } from '@epgu/ui/base';
import { LocationSelectModule } from '@epgu/ui/components/location-select';


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

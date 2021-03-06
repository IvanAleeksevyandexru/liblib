import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { StopScreenScrollModule } from '@epgu/ui/directives';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LangWarnModalModule } from '@epgu/ui/components/lang-warn-modal';
import { LoginModule } from '@epgu/ui/components/login';
import { UserMenuModule } from '@epgu/ui/components/user-menu';
import { MenuCatalogModule } from '@epgu/ui/components/menu-catalog';
import { MenuCatalogSimpleModule } from '@epgu/ui/components/menu-catalog-simple';
import { BaseModule } from '@epgu/ui/base';
import { LocationSelectModule } from '@epgu/ui/components/location-select';
import { TranslatePipeModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    StopScreenScrollModule,
    PerfectScrollbarModule,
    LangWarnModalModule,
    LoginModule,
    UserMenuModule,
    MenuCatalogModule,
    MenuCatalogSimpleModule,
    LocationSelectModule,
    BaseModule,
    TranslatePipeModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [HeaderComponent],
})
export class HeaderModule {
}

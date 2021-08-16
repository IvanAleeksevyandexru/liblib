import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogComponent } from './menu-catalog.component';
import { LogoModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';
import { CatalogTabsListModule } from '@epgu/ui/components/catalog-tabs-list';
import { LanguageSelectModule } from '@epgu/ui/base';
import { CatalogTabItemModule } from '@epgu/ui/components/catalog-tab-item';


@NgModule({
  imports: [
    CommonModule,
    LogoModule,
    TranslateModule,
    CatalogTabsListModule,
    LanguageSelectModule,
    CatalogTabItemModule,
  ],
  declarations: [
    MenuCatalogComponent
  ],
  exports: [
    MenuCatalogComponent
  ],
})
export class MenuCatalogModule {
}

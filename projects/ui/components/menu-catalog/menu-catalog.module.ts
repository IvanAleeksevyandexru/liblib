import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogComponent } from './menu-catalog.component';
import { BaseModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';
import { CatalogTabsListModule } from '@epgu/ui/components/catalog-tabs-list';
import { CatalogTabItemModule } from '@epgu/ui/components/catalog-tab-item';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    TranslateModule,
    CatalogTabsListModule,
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogComponent } from './menu-catalog.component';
import { LogoModule } from '../logo/logo.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CatalogTabsListModule } from '../catalog-tabs-list/catalog-tabs-list.module';
import { LanguageSelectModule } from '../language-select/language-select.module';
import { CatalogTabItemModule } from '../catalog-tab-item/catalog-tab-item.module';


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

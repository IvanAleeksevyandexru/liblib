import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabsComponent } from './catalog-tabs.component';
import { CatalogTabItemModule } from '@epgu/ui/components/catalog-tab-item';
import { CatalogTabsListModule } from '@epgu/ui/components/catalog-tabs-list';

@NgModule({
    imports: [
        CommonModule,
        CatalogTabItemModule,
        CatalogTabsListModule,
    ],
  declarations: [
    CatalogTabsComponent
  ],
  exports: [ CatalogTabsComponent ],
})
export class CatalogTabsModule { }

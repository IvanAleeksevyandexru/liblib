import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabsComponent } from './catalog-tabs.component';
import { CatalogTabItemModule } from '../catalog-tab-item/catalog-tab-item.module';

@NgModule({
  imports: [
    CommonModule,
    CatalogTabItemModule,
  ],
  declarations: [
    CatalogTabsComponent
  ],
  exports: [ CatalogTabsComponent ],
})
export class CatalogTabsModule { }

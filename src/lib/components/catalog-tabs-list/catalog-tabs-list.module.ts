import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemModule } from '../catalog-tab-item/catalog-tab-item.module';
import { CatalogTabsListComponent } from './catalog-tabs-list.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    CatalogTabItemModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    CatalogTabsListComponent
  ],
  exports: [ CatalogTabsListComponent ],
})
export class CatalogTabsListModule { }

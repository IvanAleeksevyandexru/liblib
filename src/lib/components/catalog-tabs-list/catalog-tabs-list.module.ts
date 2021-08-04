import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemModule } from '../catalog-tab-item/catalog-tab-item.module';
import { CatalogTabsListComponent } from './catalog-tabs-list.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { LocationSelectModule } from '../location-select/location-select.module';

@NgModule({
  imports: [
    CommonModule,
    CatalogTabItemModule,
    PerfectScrollbarModule,
    UserRolesModule,
    LocationSelectModule,
  ],
  declarations: [
    CatalogTabsListComponent
  ],
  exports: [ CatalogTabsListComponent ],
})
export class CatalogTabsListModule { }

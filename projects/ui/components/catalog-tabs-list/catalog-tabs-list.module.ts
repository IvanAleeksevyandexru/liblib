import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemModule } from '@epgu/ui/components/catalog-tab-item';
import { CatalogTabsListComponent } from './catalog-tabs-list.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UserRolesModule } from '@epgu/ui/components/user-roles';
import { LocationSelectModule } from '@epgu/ui/components/location-select';

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

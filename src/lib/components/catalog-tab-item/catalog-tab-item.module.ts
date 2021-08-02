import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemComponent } from './catalog-tab-item.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    CatalogTabItemComponent
  ],
  exports: [ CatalogTabItemComponent ],
})
export class CatalogTabItemModule { }

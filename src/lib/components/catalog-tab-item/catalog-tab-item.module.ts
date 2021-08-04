import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemComponent } from './catalog-tab-item.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RegionCasesModule } from '../region-cases/region-cases.module';
import { ThrobberHexagonModule } from '../throbber-hexagon/throbber-hexagon.module';

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    RegionCasesModule,
    ThrobberHexagonModule,
  ],
  declarations: [
    CatalogTabItemComponent
  ],
  exports: [ CatalogTabItemComponent ],
})
export class CatalogTabItemModule { }

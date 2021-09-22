import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogTabItemComponent } from './catalog-tab-item.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RegionCasesModule } from '@epgu/ui/components/region-cases';
import { ThrobberHexagonModule } from '@epgu/ui/components/throbber-hexagon';

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

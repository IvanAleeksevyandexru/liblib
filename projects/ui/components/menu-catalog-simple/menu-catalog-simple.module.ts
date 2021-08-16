import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogSimpleComponent } from './menu-catalog-simple.component';
import { LocationSelectModule } from '@epgu/ui/components/location-select';
import { TranslateModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    LocationSelectModule,
    TranslateModule,
  ],
  declarations: [
    MenuCatalogSimpleComponent
  ],
  exports: [
    MenuCatalogSimpleComponent
  ],
})
export class MenuCatalogSimpleModule {
}

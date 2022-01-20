import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogSimpleComponent } from './menu-catalog-simple.component';
import { LocationSelectModule } from '@epgu/ui/components/location-select';
import { TranslatePipeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    LocationSelectModule,
    TranslatePipeModule,
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

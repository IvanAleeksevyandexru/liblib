import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCatalogSimpleComponent } from './menu-catalog-simple.component';
import { LocationSelectModule } from '../location-select/location-select.module';
import { TranslateModule } from '../../pipes/translate/translate.module';


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

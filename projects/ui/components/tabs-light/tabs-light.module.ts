import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { TabsLightComponent } from './tabs-light.component';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    ClickOutsideModule
  ],
  declarations: [
    TabsLightComponent
  ],
  exports: [TabsLightComponent],
})
export class TabsLightModule {
}

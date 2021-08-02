import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TabsLightComponent } from './tabs-light.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ClickOutsideModule
  ],
  declarations: [
    TabsLightComponent
  ],
  exports: [ TabsLightComponent ],
})
export class TabsLightModule { }

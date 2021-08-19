import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsAsideComponent } from './tabs-aside.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    TranslatePipeModule,
    BaseModule,
  ],
  declarations: [
    TabsAsideComponent
  ],
  exports: [
    TabsAsideComponent
  ],
})
export class TabsAsideModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { BaseModule } from '@epgu/ui/base';
import { TranslatePipeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    BaseModule,
    TranslatePipeModule,
  ],
  declarations: [
    TabsComponent
  ],
  exports: [
    TabsComponent
  ],
})
export class TabsModule {
}

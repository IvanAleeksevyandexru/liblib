import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsAsideComponent } from './tabs-aside.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { TranslateModule } from '@epgu/ui/pipes';
import { CounterModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    TranslateModule,
    CounterModule,
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { CounterModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    CounterModule,
    TranslateModule,
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

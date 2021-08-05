import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { CounterModule } from '@epgu/epgu-lib/lib/components/counter';
import { TranslateModule } from '../../pipes/translate/translate.module';


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

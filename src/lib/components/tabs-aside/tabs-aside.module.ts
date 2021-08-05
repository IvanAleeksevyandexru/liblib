import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsAsideComponent } from './tabs-aside.component';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CounterModule } from 'epgu-lib/lib/components/counter';


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

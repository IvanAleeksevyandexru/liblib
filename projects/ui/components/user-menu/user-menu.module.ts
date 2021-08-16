import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from './user-menu.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { CounterModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CounterModule,
  ],
  declarations: [
    UserMenuComponent
  ],
  exports: [
    UserMenuComponent
  ],
})
export class UserMenuModule {
}

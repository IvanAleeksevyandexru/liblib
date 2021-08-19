import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from './user-menu.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    BaseModule,
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

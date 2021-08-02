import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from './user-menu.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CounterModule } from '../counter/counter.module';


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

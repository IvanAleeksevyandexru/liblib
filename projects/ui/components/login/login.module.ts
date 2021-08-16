import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { CounterModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    CounterModule,
    TranslateModule,
    ButtonModule,
    RouterModule,
  ],
  declarations: [
    LoginComponent
  ],
  exports: [
    LoginComponent
  ],
})
export class LoginModule {
}

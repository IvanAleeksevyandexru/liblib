import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { BaseModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    TranslateModule,
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

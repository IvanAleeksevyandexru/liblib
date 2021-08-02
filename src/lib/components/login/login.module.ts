import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { CounterModule } from '../counter/counter.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';
import { RouterModule } from '@angular/router';


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

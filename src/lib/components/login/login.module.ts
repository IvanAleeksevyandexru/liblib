import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { CounterModule } from '@epgu/epgu-lib/lib/components/counter';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';


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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerComponent } from './disclaimers.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { PlainInputModule } from '../plain-input/plain-input.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '../button/button.module';
import { ThrobberModule } from '../throbber/throbber.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PlainInputModule,
    ReactiveFormsModule,
    ButtonModule,
    ThrobberModule,
  ],
  declarations: [
    DisclaimerComponent
  ],
  exports: [DisclaimerComponent],
})
export class DisclaimersModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerComponent } from './disclaimers.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { PlainInputModule } from  '@epgu/epgu-lib/lib/components/plain-input';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';
import { ThrobberModule } from '@epgu/epgu-lib/lib/components/throbber';

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

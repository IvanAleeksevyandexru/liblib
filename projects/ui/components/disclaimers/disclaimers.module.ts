import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerComponent } from './disclaimers.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { PlainInputModule } from '@epgu/ui/components/plain-input';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '@epgu/ui/components/button';
import { ThrobberModule } from '@epgu/ui/components/throbber';

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerComponent } from './disclaimers.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { PlainInputModule } from '@epgu/ui/controls';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PlainInputModule,
    ReactiveFormsModule,
    BaseModule,
  ],
  declarations: [
    DisclaimerComponent
  ],
  exports: [DisclaimerComponent],
})
export class DisclaimersModule {
}

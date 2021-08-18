import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitNumberModule, PipedMessageModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';





import { StandardMaskedInputComponent } from './standard-masked-input/standard-masked-input.component';

@NgModule({
  declarations: [
    StandardMaskedInputComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    LimitNumberModule,
    ClickOutsideModule,
    RouterModule,
    StopClickPropagationModule,
    PipedMessageModule
  ],
  exports: [
    StandardMaskedInputComponent
  ],
  entryComponents: []
})
export class ControlsModule {
}

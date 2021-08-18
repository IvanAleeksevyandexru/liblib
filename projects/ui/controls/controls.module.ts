import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitNumberModule, PipedMessageModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule,
    LimitNumberModule,
    ClickOutsideModule,
    RouterModule,
    StopClickPropagationModule,
    PipedMessageModule
  ],
  exports: [],
  entryComponents: []
})
export class ControlsModule {
}

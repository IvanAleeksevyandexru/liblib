import { NgModule } from '@angular/core';
import { StopClickPropagationDirective } from './stop-click-propagation.directive';

@NgModule({
  imports: [],
  declarations: [
    StopClickPropagationDirective
  ],
  exports: [ StopClickPropagationDirective ],
})
export class StopClickPropagationModule { }

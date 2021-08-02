import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '../validation-message/validation-message.module';
import { StopClickPropagationModule } from '../../directives/stop-click-propagation/stop-click-propagation.module';
import { ClickOutsideModule } from '../../directives/click-outside/click-out.module';
import { InvalidResultsTipComponent } from './invalid-results-tip.component';


@NgModule({
  imports: [
    CommonModule,
    ValidationMessageModule,
    StopClickPropagationModule,
    ClickOutsideModule
  ],
  declarations: [
    InvalidResultsTipComponent
  ],
  exports: [ InvalidResultsTipComponent ],
})
export class InvalidResultsTipModule { }

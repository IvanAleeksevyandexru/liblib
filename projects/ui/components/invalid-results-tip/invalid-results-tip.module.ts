import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
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
  exports: [InvalidResultsTipComponent],
})
export class InvalidResultsTipModule {
}

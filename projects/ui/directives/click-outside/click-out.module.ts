import { NgModule } from '@angular/core';
import { ClickOutsideDirective } from './click-out.directive';

@NgModule({
  imports: [],
  declarations: [
    ClickOutsideDirective
  ],
  exports: [ ClickOutsideDirective ],
})
export class ClickOutsideModule { }

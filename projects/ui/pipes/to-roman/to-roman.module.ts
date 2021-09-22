import { NgModule } from '@angular/core';
import { ToRomanPipe } from './to-roman.pipe';

@NgModule({
  imports: [],
  declarations: [
    ToRomanPipe
  ],
  exports: [ToRomanPipe],
})
export class ToRomanModule {
}

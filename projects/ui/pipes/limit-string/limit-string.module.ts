import { NgModule } from '@angular/core';
import { LimitStringPipe } from './limit-string.pipe';

@NgModule({
  imports: [],
  declarations: [
    LimitStringPipe
  ],
  exports: [LimitStringPipe],
})
export class LimitStringModule {
}

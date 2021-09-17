import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse.pipe';

@NgModule({
  imports: [],
  declarations: [
    ReversePipe
  ],
  exports: [ReversePipe],
})
export class ReverseModule {
}

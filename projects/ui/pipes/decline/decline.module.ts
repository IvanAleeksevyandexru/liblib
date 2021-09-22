import { NgModule } from '@angular/core';
import { DeclinePipe } from './decline.pipe';

@NgModule({
  imports: [],
  declarations: [
    DeclinePipe
  ],
  exports: [DeclinePipe],
  providers: [DeclinePipe]
})
export class DeclineModule {
}

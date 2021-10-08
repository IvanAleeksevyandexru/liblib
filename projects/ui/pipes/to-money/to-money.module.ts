import { NgModule } from '@angular/core';
import { ToMoneyPipe } from './to-money.pipe';

@NgModule({
  imports: [],
  declarations: [
    ToMoneyPipe
  ],
  exports: [ToMoneyPipe],
})
export class ToMoneyModule {
}

import { NgModule } from '@angular/core';
import { BetaUrlPipe } from './beta-url.pipe';

@NgModule({
  imports: [],
  declarations: [
    BetaUrlPipe
  ],
  exports: [BetaUrlPipe],
})
export class BetaUrlModule {
}

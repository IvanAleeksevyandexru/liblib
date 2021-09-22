import { NgModule } from '@angular/core';
import { TimeLeftPipe } from './time-left.pipe';

@NgModule({
  imports: [],
  declarations: [
    TimeLeftPipe
  ],
  exports: [TimeLeftPipe],
})
export class TimeLeftModule {
}

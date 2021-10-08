import { NgModule } from '@angular/core';
import { TimeToEventPipe } from './time-to-event.pipe';

@NgModule({
  imports: [],
  declarations: [
    TimeToEventPipe
  ],
  exports: [TimeToEventPipe],
})
export class TimeToEventModule {
}

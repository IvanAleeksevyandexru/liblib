import { NgModule } from '@angular/core';
import { PipedMessagePipe } from './piped-message.pipe';

@NgModule({
  imports: [],
  declarations: [
    PipedMessagePipe
  ],
  exports: [ PipedMessagePipe ],
})
export class PipedMessageModule { }

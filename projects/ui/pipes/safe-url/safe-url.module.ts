import { NgModule } from '@angular/core';
import { SafeUrlPipe } from './safe-url.pipe';

@NgModule({
  imports: [

  ],
  declarations: [
    SafeUrlPipe
  ],
  exports: [ SafeUrlPipe ],
})
export class SafeUrlModule { }

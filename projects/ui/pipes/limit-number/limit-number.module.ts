import { NgModule } from '@angular/core';
import { LimitNumberPipe } from './limit-number.pipe';

@NgModule({
  imports: [

  ],
  declarations: [
    LimitNumberPipe
  ],
  exports: [ LimitNumberPipe ],
})
export class LimitNumberModule { }

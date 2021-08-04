import { NgModule } from '@angular/core';
import { FormatTimePipe } from './format-time.pipe';

@NgModule({
  imports: [],
  declarations: [
    FormatTimePipe
  ],
  exports: [FormatTimePipe],
})
export class FormatTimeModule {
}

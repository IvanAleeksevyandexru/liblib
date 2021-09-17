import { NgModule } from '@angular/core';
import { FormatPhonePipe } from './format-phone.pipe';

@NgModule({
  imports: [],
  declarations: [
    FormatPhonePipe
  ],
  exports: [FormatPhonePipe],
})
export class FormatPhoneModule {
}

import { NgModule } from '@angular/core';
import { ConvertSizePipe } from './convert-size.pipe';

@NgModule({
  imports: [],
  declarations: [
    ConvertSizePipe
  ],
  exports: [ConvertSizePipe],
})
export class ConvertSizeModule {
}

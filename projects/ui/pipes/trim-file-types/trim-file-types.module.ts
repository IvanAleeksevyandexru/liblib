import { NgModule } from '@angular/core';
import { TrimFileTypesPipe } from './trim-file-types.pipe';

@NgModule({
  imports: [],
  declarations: [
    TrimFileTypesPipe
  ],
  exports: [TrimFileTypesPipe],
})
export class TrimFileTypesModule {
}

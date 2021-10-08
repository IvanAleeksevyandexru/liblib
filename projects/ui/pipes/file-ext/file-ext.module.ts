import { NgModule } from '@angular/core';
import { FileExtPipe } from './file-ext.pipe';

@NgModule({
  imports: [],
  declarations: [
    FileExtPipe
  ],
  exports: [FileExtPipe],
  providers: [FileExtPipe]
})
export class FileExtModule {
}

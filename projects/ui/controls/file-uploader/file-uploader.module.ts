import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { ThrobberModule } from '@epgu/ui/base';
import { DragAndDropModule } from '@epgu/ui/directives';
import { FileSizeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    DragAndDropModule,
    FileSizeModule,
  ],
  declarations: [
    FileUploaderComponent,
  ],
  exports: [FileUploaderComponent],
})
export class FileUploaderModule {
}

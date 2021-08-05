import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { ThrobberModule } from 'epgu-lib/lib/components/throbber';
import { DragAndDropModule } from '../../directives/drag-and-drop/drag-and-drop.module';
import { FileSizeModule } from '../../pipes/file-size/file-size.module';


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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { ThrobberModule } from '../throbber/throbber.module';
import { DragAndDropModule } from '../../directives/drag-and-drop/drag-and-drop.module';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    DragAndDropModule,
  ],
  declarations: [
    FileUploaderComponent,
  ],
  exports: [FileUploaderComponent],
})
export class FileUploaderModule {
}

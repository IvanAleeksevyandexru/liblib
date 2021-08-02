import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileExtensionIconComponent } from './file-extension-icon.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    FileExtensionIconComponent
  ],
  exports: [FileExtensionIconComponent],
})
export class FileExtensionIconModule {
}

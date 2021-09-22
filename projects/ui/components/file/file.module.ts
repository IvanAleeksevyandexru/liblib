import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { BaseModule } from '@epgu/ui/base';
import { ActionsMenuModule } from '@epgu/ui/components/actions-menu';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    ActionsMenuModule,
  ],
  declarations: [
    FileComponent
  ],
  exports: [FileComponent],
})
export class FileModule {
}

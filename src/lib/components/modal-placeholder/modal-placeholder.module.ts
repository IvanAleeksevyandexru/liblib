import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPlaceholderComponent } from './modal-placeholder.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ModalPlaceholderComponent
  ],
  entryComponents: [
  ],
  exports: [ ModalPlaceholderComponent ],
})

export class ModalPlaceholderModule { }

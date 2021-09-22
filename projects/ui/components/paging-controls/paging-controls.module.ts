import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagingControlsComponent } from './paging-controls.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PagingControlsComponent
  ],
  exports: [ PagingControlsComponent ],
})
export class PagingControlsModule { }

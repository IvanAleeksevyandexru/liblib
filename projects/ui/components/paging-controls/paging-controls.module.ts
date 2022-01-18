import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagingControlsComponent } from './paging-controls.component';
import { ClickOutsideModule } from '@epgu/ui/directives';

@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule
  ],
  declarations: [
    PagingControlsComponent
  ],
  exports: [ PagingControlsComponent ],
})
export class PagingControlsModule { }

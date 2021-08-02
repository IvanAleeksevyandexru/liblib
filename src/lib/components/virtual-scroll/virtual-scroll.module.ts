import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollComponent } from './virtual-scroll.component';


@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule
  ],
  declarations: [
    VirtualScrollComponent
  ],
  exports: [ VirtualScrollComponent ],
})
export class VirtualScrollModule { }

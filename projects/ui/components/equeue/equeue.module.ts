import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqueueComponent } from './equeue.component';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    EqueueComponent
  ],
  exports: [EqueueComponent],
})
export class EqueueModule {
}

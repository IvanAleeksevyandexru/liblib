import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsHeaderComponent } from './feeds-header.component';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    FeedsHeaderComponent
  ],
  exports: [FeedsHeaderComponent],
})
export class FeedsHeaderModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GosbarComponent } from './gosbar.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    GosbarComponent
  ],
  exports: [GosbarComponent],
})
export class GosbarModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightHeaderComponent } from './light-header.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    LightHeaderComponent
  ],
  exports: [
    LightHeaderComponent
  ],
})
export class LightHeaderModule {
}

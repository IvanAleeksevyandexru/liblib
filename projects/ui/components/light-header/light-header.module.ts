import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightHeaderComponent } from './light-header.component';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
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

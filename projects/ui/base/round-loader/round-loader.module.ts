import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundLoaderComponent } from './round-loader.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RoundLoaderComponent
  ],
  exports: [ RoundLoaderComponent ],
})
export class RoundLoaderModule { }

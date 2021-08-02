import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoundLoaderComponent } from './round-loader.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    RoundLoaderComponent
  ],
  exports: [ RoundLoaderComponent ],
})
export class RoundLoaderModule { }

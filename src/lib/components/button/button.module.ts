import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './button.component';
import { RoundLoaderModule } from '../round-loader/round-loader.module';
// import { LoaderModule } from '../loader/loader.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RoundLoaderModule
  ],
  declarations: [
    ButtonComponent
  ],
  exports: [ ButtonComponent ],
})
export class ButtonModule { }

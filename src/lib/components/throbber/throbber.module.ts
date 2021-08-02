import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThrobberComponent } from './throbber.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ThrobberComponent
  ],
  exports: [ ThrobberComponent ],
})
export class ThrobberModule { }

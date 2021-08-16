import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { StopScreenScrollModule } from '@epgu/ui/directives';
import { MultilineInputComponent } from './multiline-input.component';

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    StopScreenScrollModule
  ],
  declarations: [
    MultilineInputComponent
  ],
  exports: [MultilineInputComponent],
})
export class MultilineInputModule {
}

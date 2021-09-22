import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentComponent } from './department.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
  ],
  declarations: [
    DepartmentComponent
  ],
  exports: [DepartmentComponent],
})
export class DepartmentModule {
}

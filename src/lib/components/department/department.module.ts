import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentComponent } from './department.component';
import { TranslateModule } from '../../pipes/translate/translate.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    DepartmentComponent
  ],
  exports: [DepartmentComponent],
})
export class DepartmentModule {
}

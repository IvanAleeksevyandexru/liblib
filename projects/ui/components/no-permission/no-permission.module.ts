import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoPermissionComponent } from './no-permission.component';
import { BaseModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    BaseModule,
  ],
  declarations: [
    NoPermissionComponent
  ],
  exports: [NoPermissionComponent],
})
export class NoPermissionModule {
}

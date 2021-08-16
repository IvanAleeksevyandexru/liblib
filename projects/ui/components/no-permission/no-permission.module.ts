import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoPermissionComponent } from './no-permission.component';
import { ButtonModule } from '@epgu/ui/base';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
  ],
  declarations: [
    NoPermissionComponent
  ],
  exports: [NoPermissionComponent],
})
export class NoPermissionModule {
}

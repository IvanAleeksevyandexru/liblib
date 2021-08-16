import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRolesComponent } from './user-roles.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    UserRolesComponent
  ],
  exports: [
    UserRolesComponent
  ],
})
export class UserRolesModule {
}

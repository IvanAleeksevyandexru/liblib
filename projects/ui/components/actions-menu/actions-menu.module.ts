import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsMenuComponent } from './actions-menu.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { ClickOutsideModule } from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    ClickOutsideModule,
    RouterModule,
  ],
  declarations: [
    ActionsMenuComponent
  ],
  exports: [ ActionsMenuComponent ],
})
export class ActionsMenuModule { }

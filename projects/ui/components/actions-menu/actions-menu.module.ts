import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsMenuComponent } from './actions-menu.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule
  ],
  declarations: [
    ActionsMenuComponent
  ],
  exports: [ ActionsMenuComponent ],
})
export class ActionsMenuModule { }

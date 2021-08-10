import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsMenuComponent } from './actions-menu.component';
import { TranslateModule } from '@epgu/ui/pipes/translate';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    ActionsMenuComponent
  ],
  exports: [ ActionsMenuComponent ],
})
export class ActionsMenuModule { }

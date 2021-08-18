import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes';
import { ConfirmActionComponent } from './confirm-action.component';
import { BaseModule } from '@epgu/ui/base';
import { CheckboxModule } from '@epgu/ui/controls';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CheckboxModule,
    BaseModule
  ],
  declarations: [
    ConfirmActionComponent
  ],
  exports: [ ConfirmActionComponent ],
  entryComponents: [ ConfirmActionComponent ],
})
export class ConfirmActionModule { }

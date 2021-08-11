import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { CheckboxModule } from '@epgu/ui/components/checkbox';
import { ConfirmActionComponent } from './confirm-action.component';
import { ButtonModule } from '@epgu/ui/components/button';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CheckboxModule,
    ButtonModule
  ],
  declarations: [
    ConfirmActionComponent
  ],
  exports: [ ConfirmActionComponent ],
  entryComponents: [ ConfirmActionComponent ],
})
export class ConfirmActionModule { }

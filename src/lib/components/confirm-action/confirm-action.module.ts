import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { ConfirmActionComponent } from './confirm-action.component';
import { ButtonModule } from '../button/button.module';

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

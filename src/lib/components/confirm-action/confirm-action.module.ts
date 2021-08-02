import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { ButtonModule } from '../button/button.module';
import { ConfirmActionComponent } from './confirm-action.component';

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
})
export class ConfirmActionModule { }

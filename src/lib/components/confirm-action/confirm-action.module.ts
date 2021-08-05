import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { CheckboxModule } from 'epgu-lib/lib/components/checkbox';
import { ConfirmActionComponent } from './confirm-action.component';
import { ButtonModule } from 'epgu-lib/lib/components/button';

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

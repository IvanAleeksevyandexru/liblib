import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { InvalidResultsTipModule } from '@epgu/ui/components/invalid-results-tip';
import { PlainInputModule } from '../plain-input';
import { BaseModule } from '@epgu/ui/base';
import { StandardInputComponent } from './standard-input.component';


@NgModule({
  imports: [
    CommonModule,
    ValidationMessageModule,
    InvalidResultsTipModule,
    PlainInputModule,
    BaseModule
  ],
  declarations: [
    StandardInputComponent
  ],
  exports: [ StandardInputComponent ],
})
export class StandardInputModule { }

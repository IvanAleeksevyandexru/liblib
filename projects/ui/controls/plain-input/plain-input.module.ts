import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@epgu/ui/pipes';
import { PlainInputComponent } from './plain-input.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    PlainInputComponent
  ],
  exports: [ PlainInputComponent ],
})
export class PlainInputModule { }

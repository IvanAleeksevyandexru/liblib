import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizComponent } from './quiz.component';
import { ControlsModule } from '@epgu/ui/controls';
import { BaseModule } from '@epgu/ui/base';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ControlsModule,
    BaseModule,
    TranslatePipeModule,
    FormsModule,
  ],
  declarations: [
    QuizComponent
  ],
  exports: [
    QuizComponent
  ],
})
export class QuizModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizComponent } from './quiz.component';
import { PlainInputModule } from '@epgu/ui/controls';
import { ButtonModule } from '@epgu/ui/base';
import { TranslateModule } from '@epgu/ui/pipes';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        PlainInputModule,
        ButtonModule,
        TranslateModule,
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

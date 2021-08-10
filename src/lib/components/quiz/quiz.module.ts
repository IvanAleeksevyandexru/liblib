import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizComponent } from './quiz.component';
import { PlainInputModule } from '../plain-input/plain-input.module';
import { ButtonModule } from '../button/button.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
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

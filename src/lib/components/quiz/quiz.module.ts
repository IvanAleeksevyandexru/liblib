import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizComponent } from './quiz.component';
import { PlainInputModule } from  'epgu-lib/lib/components/plain-input';
import { ButtonModule } from 'epgu-lib/lib/components/button';
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

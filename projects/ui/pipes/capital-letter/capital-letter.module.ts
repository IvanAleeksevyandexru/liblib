import { NgModule } from '@angular/core';
import { CapitalLetterPipe } from './capital-letter.pipe';

@NgModule({
  imports: [],
  declarations: [
    CapitalLetterPipe
  ],
  exports: [CapitalLetterPipe],
})
export class CapitalLetterModule {
}

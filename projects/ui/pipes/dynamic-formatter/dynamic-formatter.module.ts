import { NgModule } from '@angular/core';
import { DynamicFormatterPipe } from './dynamic-formatter.pipe';

@NgModule({
  imports: [],
  declarations: [
    DynamicFormatterPipe
  ],
  exports: [DynamicFormatterPipe],
})
export class DynamicFormatterModule {
}

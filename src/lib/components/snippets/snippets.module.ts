import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnippetsComponent } from './snippets.component';
import { ButtonModule } from '../button/button.module';


@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
  ],
  declarations: [
    SnippetsComponent
  ],
  exports: [
    SnippetsComponent
  ],
})
export class SnippetsModule {
}

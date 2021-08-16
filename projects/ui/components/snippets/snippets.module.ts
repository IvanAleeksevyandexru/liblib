import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnippetsComponent } from './snippets.component';
import { ButtonModule } from '@epgu/ui/base';
import { LimitStringModule, RemoveTagsModule, TimeToEventModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    TimeToEventModule,
    RemoveTagsModule,
    LimitStringModule,
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

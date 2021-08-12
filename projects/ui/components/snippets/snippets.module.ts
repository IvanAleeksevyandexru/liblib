import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnippetsComponent } from './snippets.component';
import { ButtonModule } from '@epgu/ui/components/button';
import { TimeToEventModule } from '@epgu/ui/pipes/time-to-event';
import { RemoveTagsModule } from '@epgu/ui/pipes/remove-tags';
import { LimitStringModule } from '@epgu/ui/pipes/limit-string';


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

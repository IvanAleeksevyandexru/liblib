import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnippetsComponent } from './snippets.component';
import { ButtonModule } from 'epgu-lib/lib/components/button';
import { TimeToEventModule } from '../../pipes/time-to-event/time-to-event.module';
import { RemoveTagsModule } from '../../pipes/remove-tags/remove-tags.module';
import { LimitStringModule } from '../../pipes/limit-string/limit-string.module';


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

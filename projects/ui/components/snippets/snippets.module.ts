import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnippetsComponent } from './snippets.component';
import { BaseModule } from '@epgu/ui/base';
import { LimitStringModule, RemoveTagsModule, TimeToEventModule, ToMoneyModule } from '@epgu/ui/pipes';


@NgModule({
    imports: [
        CommonModule,
        BaseModule,
        TimeToEventModule,
        RemoveTagsModule,
        LimitStringModule,
        ToMoneyModule,
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

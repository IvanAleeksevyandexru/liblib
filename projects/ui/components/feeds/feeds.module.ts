import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsComponent } from './feeds.component';
import { RouterModule } from '@angular/router';
import { BaseModule } from '@epgu/ui/base';
import {
  HighlightModule,
  RemoveColonModule,
  RemoveQuotesModule,
  RemoveTagsModule,
  TimeLeftModule,
  TimeToEventModule,
  TranslatePipeModule
} from '@epgu/ui/pipes';
import { FeedIconModule } from '@epgu/ui/components/feed-icon';
import { SnippetsModule } from '@epgu/ui/components/snippets';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipeModule,
    BaseModule,
    FeedIconModule,
    HighlightModule,
    RemoveQuotesModule,
    RemoveColonModule,
    TimeToEventModule,
    RemoveTagsModule,
    TimeLeftModule,
    SnippetsModule,
  ],
  declarations: [
    FeedsComponent
  ],
  exports: [FeedsComponent],
})
export class FeedsModule {
}

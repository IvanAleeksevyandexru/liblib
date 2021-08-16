import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsComponent } from './feeds.component';
import { RouterModule } from '@angular/router';
import { LoaderModule,ThrobberModule } from '@epgu/ui/base';
import {
  HighlightModule,
  RemoveColonModule,
  RemoveQuotesModule,
  RemoveTagsModule,
  TimeLeftModule,
  TimeToEventModule,
  TranslateModule
} from '@epgu/ui/pipes';
import { ButtonModule } from '@epgu/ui/base';
import { FeedIconModule } from '@epgu/ui/components/feed-icon';
import { SnippetsModule } from '@epgu/ui/components/snippets';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    RouterModule,
    LoaderModule,
    TranslateModule,
    ButtonModule,
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

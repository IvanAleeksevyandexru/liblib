import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsComponent } from './feeds.component';
import { ThrobberModule } from '@epgu/ui/components/throbber';
import { RouterModule } from '@angular/router';
import { LoaderModule } from '@epgu/ui/components/loader';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { ButtonModule } from '@epgu/ui/components/button';
import { FeedIconModule } from '@epgu/ui/components/feed-icon';
import { HighlightModule } from '@epgu/ui/pipes/highlight';
import { RemoveQuotesModule } from '@epgu/ui/pipes/remove-quotes';
import { RemoveColonModule } from '@epgu/ui/pipes/remove-colon';
import { TimeToEventModule } from '@epgu/ui/pipes/time-to-event';
import { RemoveTagsModule } from '@epgu/ui/pipes/remove-tags';
import { TimeLeftModule } from '@epgu/ui/pipes/time-left';
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

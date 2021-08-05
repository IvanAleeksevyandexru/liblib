import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsComponent } from './feeds.component';
import { ThrobberModule } from '@epgu/epgu-lib/lib/components/throbber';
import { RouterModule } from '@angular/router';
import { LoaderModule } from '@epgu/epgu-lib/lib/components/loader';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';
import { FeedIconModule } from '../feed-icon/feed-icon.module';
import { HighlightModule } from '../../pipes/highlight/highlight.module';
import { RemoveQuotesModule } from '../../pipes/remove-quotes/remove-quotes.module';
import { RemoveColonModule } from '../../pipes/remove-colon/remove-colon.module';
import { TimeToEventModule } from '../../pipes/time-to-event/time-to-event.module';
import { RemoveTagsModule } from '../../pipes/remove-tags/remove-tags.module';
import { TimeLeftModule } from '../../pipes/time-left/time-left.module';
import { SnippetsModule } from '../snippets/snippets.module';


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

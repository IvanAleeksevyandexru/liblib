import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsComponent } from './feeds.component';
import { ThrobberModule } from '../throbber/throbber.module';
import { RouterModule } from '@angular/router';
import { LoaderModule } from '../loader/loader.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';
import { FeedIconModule } from '../feed-icon/feed-icon.module';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    RouterModule,
    LoaderModule,
    TranslateModule,
    ButtonModule,
    FeedIconModule,
  ],
  declarations: [
    FeedsComponent
  ],
  exports: [FeedsComponent],
})
export class FeedsModule {
}

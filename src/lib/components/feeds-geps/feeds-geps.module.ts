import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsGepsComponent } from './feeds-geps.component';
import { ThrobberModule } from '../throbber/throbber.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from 'epgu-lib/lib/components/checkbox';
import { FormsModule } from '@angular/forms';
import { BannerStaticModule } from '../banner-static/banner-static.module';
import { HighlightModule } from '../../pipes/highlight/highlight.module';
import { TimeToEventGepsModule } from '../../pipes/time-to-event-geps/time-to-event-geps.module';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    TranslateModule,
    RouterModule,
    CheckboxModule,
    FormsModule,
    BannerStaticModule,
    HighlightModule,
    TimeToEventGepsModule,
  ],
  declarations: [
    FeedsGepsComponent
  ],
  exports: [FeedsGepsComponent],
})
export class FeedsGepsModule {
}

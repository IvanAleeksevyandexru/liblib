import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsGepsComponent } from './feeds-geps.component';
import { ThrobberModule } from '@epgu/ui/components/throbber';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { FormsModule } from '@angular/forms';
import { BannerStaticModule } from '@epgu/ui/components/banner-static';
import { HighlightModule } from '@epgu/ui/pipes/highlight';
import { TimeToEventGepsModule } from '@epgu/ui/pipes/time-to-event-geps';


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

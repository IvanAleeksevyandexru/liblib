import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsGepsComponent } from './feeds-geps.component';
import { BaseModule } from '@epgu/ui/base';
import { HighlightModule, TimeToEventGepsModule, TranslatePipeModule } from '@epgu/ui/pipes';
import { RouterModule } from '@angular/router';
import { ControlsModule } from '@epgu/ui/controls';
import { FormsModule } from '@angular/forms';
import { BannerStaticModule } from '@epgu/ui/components/banner-static';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    TranslatePipeModule,
    RouterModule,
    ControlsModule,
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

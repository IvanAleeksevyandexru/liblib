import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmallFooterComponent } from './small-footer.component';
import { SocialLinksModule } from '@epgu/ui/components/social-links';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    SocialLinksModule,
  ],
  declarations: [
    SmallFooterComponent
  ],
  exports: [
    SmallFooterComponent
  ],
})
export class SmallFooterModule {
}

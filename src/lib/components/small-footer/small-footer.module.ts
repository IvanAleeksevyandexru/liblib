import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmallFooterComponent } from './small-footer.component';
import { AccordionModule } from '@epgu/epgu-lib/lib/components/accordion';
import { ExpansionPanelModule } from '@epgu/epgu-lib/lib/components/expansion-panel';
import { SocialLinksModule } from '../social-links/social-links.module';


@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    ExpansionPanelModule,
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

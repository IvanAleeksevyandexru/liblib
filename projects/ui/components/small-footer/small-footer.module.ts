import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmallFooterComponent } from './small-footer.component';
import { SocialLinksModule } from '@epgu/ui/components/social-links';
import { AccordionModule, ExpansionPanelModule } from '@epgu/ui/base';


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

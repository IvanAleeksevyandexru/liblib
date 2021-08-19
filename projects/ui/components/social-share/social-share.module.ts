import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialShareComponent } from './social-share.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
  ],
  declarations: [
    SocialShareComponent
  ],
  exports: [
    SocialShareComponent
  ],
})
export class SocialShareModule {
}

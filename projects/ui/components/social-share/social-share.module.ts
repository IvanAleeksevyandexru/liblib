import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialShareComponent } from './social-share.component';
import { TranslateModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
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

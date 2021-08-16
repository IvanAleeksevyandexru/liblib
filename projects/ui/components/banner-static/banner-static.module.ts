import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticBannerComponent } from './banner-static.component';
import { SafeHtmlModule } from '@epgu/ui/pipes';

@NgModule({
  imports: [
    CommonModule,
    SafeHtmlModule,
  ],
  declarations: [
    StaticBannerComponent
  ],
  exports: [StaticBannerComponent],
})
export class BannerStaticModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticBannerComponent } from './banner-static.component';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedsGepsComponent } from './feeds-geps.component';
import { ThrobberModule } from '../throbber/throbber.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { FormsModule } from '@angular/forms';
import { BannerStaticModule } from '../banner-static/banner-static.module';


@NgModule({
  imports: [
    CommonModule,
    ThrobberModule,
    TranslateModule,
    RouterModule,
    CheckboxModule,
    FormsModule,
    BannerStaticModule,
  ],
  declarations: [
    FeedsGepsComponent
  ],
  exports: [FeedsGepsComponent],
})
export class FeedsGepsModule {
}

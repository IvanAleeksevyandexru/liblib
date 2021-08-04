import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightHeaderComponent } from './light-header.component';
import { LogoModule } from '../logo/logo.module';


@NgModule({
    imports: [
        CommonModule,
        LogoModule,
    ],
  declarations: [
    LightHeaderComponent
  ],
  exports: [
    LightHeaderComponent
  ],
})
export class LightHeaderModule {
}

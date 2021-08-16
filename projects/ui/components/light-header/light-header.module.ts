import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightHeaderComponent } from './light-header.component';
import { LogoModule } from '@epgu/ui/base';


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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsLoaderComponent } from './eds-loader.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { ThrobberHexagonModule } from '@epgu/ui/components/throbber-hexagon';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    ThrobberHexagonModule
  ],
  declarations: [
    EdsLoaderComponent
  ],
  exports: [EdsLoaderComponent],
  entryComponents: [EdsLoaderComponent],
})
export class EdsLoaderModule {
}

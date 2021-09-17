import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsLoaderComponent } from './eds-loader.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
  ],
  declarations: [
    EdsLoaderComponent
  ],
  exports: [EdsLoaderComponent],
  entryComponents: [EdsLoaderComponent],
})
export class EdsLoaderModule {
}

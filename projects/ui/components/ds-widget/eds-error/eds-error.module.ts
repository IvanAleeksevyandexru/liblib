import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsErrorComponent } from './eds-error.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    BaseModule,
  ],
  declarations: [
    EdsErrorComponent
  ],
  exports: [EdsErrorComponent],
  entryComponents: [EdsErrorComponent],
})
export class EdsErrorModule {
}

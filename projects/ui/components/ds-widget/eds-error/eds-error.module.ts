import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsErrorComponent } from './eds-error.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { ButtonModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
  ],
  declarations: [
    EdsErrorComponent
  ],
  exports: [EdsErrorComponent],
  entryComponents: [EdsErrorComponent],
})
export class EdsErrorModule {
}

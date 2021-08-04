import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdsLoaderComponent } from './eds-loader.component';
import { TranslateModule } from '../../../pipes/translate/translate.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    EdsLoaderComponent
  ],
  exports: [EdsLoaderComponent],
  entryComponents: [EdsLoaderComponent],
})
export class EdsLoaderModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedIconComponent } from './feed-icon.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    FeedIconComponent
  ],
  exports: [FeedIconComponent],
})
export class FeedIconModule {
}

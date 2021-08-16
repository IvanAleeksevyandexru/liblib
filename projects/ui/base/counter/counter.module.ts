import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitNumberModule } from '@epgu/ui/pipes';
import { CounterComponent } from './counter.component';


@NgModule({
  imports: [
    CommonModule,
    LimitNumberModule
  ],
  declarations: [
    CounterComponent
  ],
  exports: [CounterComponent],
})
export class CounterModule {
}

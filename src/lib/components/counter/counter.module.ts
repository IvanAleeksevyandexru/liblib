import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitNumberModule } from '../../pipes/limit-number/limit-number.module';
import { CounterComponent } from './counter.component';


@NgModule({
  imports: [
    CommonModule,
    LimitNumberModule
  ],
  declarations: [
    CounterComponent
  ],
  exports: [ CounterComponent ],
})
export class CounterModule { }

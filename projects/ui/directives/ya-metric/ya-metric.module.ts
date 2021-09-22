import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YaMetricDirective } from './ya-metric.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    YaMetricDirective
  ],
  exports: [YaMetricDirective],
})
export class YaMetricModule {
}

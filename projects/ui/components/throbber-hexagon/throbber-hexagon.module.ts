import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThrobberHexagonComponent } from './throbber-hexagon.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ThrobberHexagonComponent
  ],
  exports: [
    ThrobberHexagonComponent
  ],
})
export class ThrobberHexagonModule {
}

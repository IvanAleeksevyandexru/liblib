import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformerComponent } from './informer.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';
import { ThrobberHexagonModule } from '@epgu/ui/components/throbber-hexagon';
import { ToMoneyModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    BaseModule,
    ThrobberHexagonModule,
    ToMoneyModule
  ],
  declarations: [
    InformerComponent,
  ],
  exports: [
    InformerComponent,
  ],
})
export class InformerModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformerComponent } from './informer.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { ButtonModule } from '@epgu/ui/base';
import { ThrobberHexagonModule } from '@epgu/ui/components/throbber-hexagon';
import { ToMoneyModule } from '@epgu/ui/pipes';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
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

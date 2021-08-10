import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformerComponent } from './informer.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { ButtonModule } from '../button/button.module';
import { ThrobberHexagonModule } from '../throbber-hexagon/throbber-hexagon.module';
import { ToMoneyModule } from '../../pipes/to-money/to-money.module';


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

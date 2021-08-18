import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitNumberModule, PipedMessageModule, TranslateModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { BaseMaskedInputComponent } from './base-masked-input/base-masked-input.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { BaseModule } from '@epgu/ui/base';
import { DadataModalComponent } from './dadata-modal/dadata-modal.component';
import { StandardMaskedInputComponent } from './standard-masked-input/standard-masked-input.component';

@NgModule({
  declarations: [
    AutocompleteComponent,
    BaseMaskedInputComponent,
    CheckboxComponent,
    DadataModalComponent,
    StandardMaskedInputComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    LimitNumberModule,
    ClickOutsideModule,
    RouterModule,
    StopClickPropagationModule,
    PipedMessageModule,
    BaseModule
  ],
  exports: [
    AutocompleteComponent,
    BaseMaskedInputComponent,
    CheckboxComponent,
    DadataModalComponent,
    StandardMaskedInputComponent
  ],
  entryComponents: []
})
export class ControlsModule {
}

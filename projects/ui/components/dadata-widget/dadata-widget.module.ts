import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataWidgetComponent } from './dadata-widget.component';
import { AutocompleteModule } from '@epgu/ui/components/autocomplete';
import { TranslateModule } from '@epgu/ui/pipes/translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from '@epgu/ui/components/checkbox';
import { PlainInputModule } from '@epgu/ui/components/plain-input';
import { DropdownModule } from '@epgu/ui/components/dropdown';
import { MapModule } from '@epgu/ui/components/map';
import { BaseMaskedInputModule } from '@epgu/ui/components/base-masked-input';

@NgModule({
  imports: [
    CommonModule,
    AutocompleteModule,
    TranslateModule,
    ReactiveFormsModule,
    CheckboxModule,
    PlainInputModule,
    BaseMaskedInputModule,
    FormsModule,
    DropdownModule,
    MapModule,
  ],
  declarations: [
    DadataWidgetComponent
  ],
  exports: [ DadataWidgetComponent ],
})
export class DadataWidgetModule { }

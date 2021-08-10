import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataWidgetComponent } from './dadata-widget.component';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { PlainInputModule } from  '../plain-input/plain-input.module';
import { DropdownModule } from '../dropdown/dropdown.module';
import { MapModule } from '../map/map.module';
import { BaseMaskedInputModule } from '../base-masked-input/base-masked-input.module';

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

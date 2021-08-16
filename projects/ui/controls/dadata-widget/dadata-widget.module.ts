import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataWidgetComponent } from './dadata-widget.component';
import { AutocompleteModule } from '../autocomplete';
import { TranslateModule } from '@epgu/ui/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from '../checkbox';
import { PlainInputModule } from '../plain-input';
import { DropdownModule } from '../dropdown';
import { MapModule } from '@epgu/ui/base';
import { BaseMaskedInputModule } from '../base-masked-input';

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

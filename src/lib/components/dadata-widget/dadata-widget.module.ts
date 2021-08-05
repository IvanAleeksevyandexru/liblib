import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadataWidgetComponent } from './dadata-widget.component';
import { AutocompleteModule } from '@epgu/epgu-lib/lib/components/autocomplete';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from '@epgu/epgu-lib/lib/components/checkbox';
import { PlainInputModule } from  '@epgu/epgu-lib/lib/components/plain-input';
import { DropdownModule } from '../dropdown/dropdown.module';
import { MapModule } from '../map/map.module';
import { BaseMaskedInputModule } from '@epgu/epgu-lib/lib/components/base-masked-input';

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

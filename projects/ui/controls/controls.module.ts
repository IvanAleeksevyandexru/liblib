import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DeclineModule, FileSizeModule,
  LimitNumberModule,
  PipedMessageModule,
  SafeHtmlModule,
  SubstModule,
  TranslateModule
} from '@epgu/ui/pipes';
import {
  ClickOutsideModule, DragAndDropModule,
  StopClickPropagationModule,
  StopScreenScrollModule,
  VirtualForOfModule
} from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { BaseMaskedInputComponent } from './base-masked-input/base-masked-input.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { BaseModule } from '@epgu/ui/base';
import { DadataModalComponent } from './dadata-modal/dadata-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DadataWidgetComponent } from './dadata-widget/dadata-widget.component';
import { ValidationMessageModule } from '@epgu/ui/components/validation-message';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { VirtualScrollModule } from '@epgu/ui/components/virtual-scroll';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DropdownSimpleComponent } from './dropdown-simple/dropdown-simple.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { FilteredListComponent } from './filtered-list/filtered-list.component';
import { LookupComponent } from './lookup/lookup.component';
import { StandardMaskedInputComponent } from './standard-masked-input/standard-masked-input.component';


@NgModule({
  declarations: [
    AutocompleteComponent,
    BaseMaskedInputComponent,
    CheckboxComponent,
    DadataModalComponent,
    DadataWidgetComponent,
    DatePickerComponent,
    DropdownComponent,
    DropdownSimpleComponent,
    FileUploaderComponent,
    FilteredListComponent,
    LookupComponent,
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
    BaseModule,
    ReactiveFormsModule,
    FormsModule,
    ValidationMessageModule,
    SafeHtmlModule,
    SubstModule,
    StopScreenScrollModule,
    PerfectScrollbarModule,
    VirtualScrollModule,
    DeclineModule,
    VirtualForOfModule,
    DragAndDropModule,
    FileSizeModule,
  ],
  exports: [
    AutocompleteComponent,
    BaseMaskedInputComponent,
    CheckboxComponent,
    DadataModalComponent,
    DadataWidgetComponent,
    DatePickerComponent,
    DropdownComponent,
    DropdownSimpleComponent,
    FileUploaderComponent,
    FilteredListComponent,
    LookupComponent,
    StandardMaskedInputComponent
  ],
  entryComponents: []
})
export class ControlsModule {
}

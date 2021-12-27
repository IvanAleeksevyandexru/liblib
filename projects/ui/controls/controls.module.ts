import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    CapitalLetterModule,
    DeclineModule, FileSizeModule,
    LimitNumberModule,
    PipedMessageModule,
    SafeHtmlModule,
    SubstModule,
    TranslatePipeModule, TrimFileTypesModule
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
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { MonthYearSelectComponent } from './month-year-select/month-year-select.component';
import { MultiLookupComponent } from './multi-lookup/multi-lookup.component';
import { MultilineInputComponent } from './multiline-input/multiline-input.component';
import { PlainInputComponent } from './plain-input/plain-input.component';
import { RadioComponent } from './radio/radio.component';
import { RangeFieldComponent } from './range-field/range-field.component';
import { RangeSelectorComponent } from './range-selector/range-selector.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { StandardInputComponent } from './standard-input/standard-input.component';
import { StandardMaskedInputComponent } from './standard-masked-input/standard-masked-input.component';
import { TextMaskModule } from 'angular2-text-mask';
import { InvalidResultsTipModule } from '@epgu/ui/components/invalid-results-tip';


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
        MonthPickerComponent,
        MonthYearSelectComponent,
        MultiLookupComponent,
        MultilineInputComponent,
        PlainInputComponent,
        RadioComponent,
        RangeFieldComponent,
        RangeSelectorComponent,
        SearchBarComponent,
        StandardInputComponent,
        StandardMaskedInputComponent
    ],
    imports: [
        CommonModule,
        TranslatePipeModule,
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
        TextMaskModule,
        InvalidResultsTipModule,
        TrimFileTypesModule,
        CapitalLetterModule,
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
        MonthPickerComponent,
        MonthYearSelectComponent,
        MultiLookupComponent,
        MultilineInputComponent,
        PlainInputComponent,
        RadioComponent,
        RangeFieldComponent,
        RangeSelectorComponent,
        SearchBarComponent,
        StandardInputComponent,
        StandardMaskedInputComponent
    ]
})
export class ControlsModule {
}

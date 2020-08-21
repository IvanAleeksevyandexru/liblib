import { Component, ViewChild, Input, Output, EventEmitter,
  OnInit, AfterViewInit, DoCheck, OnChanges, OnDestroy, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseMaskedInputComponent } from '../base-masked-input/base-masked-input.component';
import { Focusable } from '../../services/focus/focus.manager';
import { PipedMessage } from '../../models/piped-message';
import { InputAutocomplete, TipDirection } from '../../models/common-enums';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'lib-standard-masked-input',
  templateUrl: 'standard-masked-input.component.html',
  styleUrls: ['./standard-masked-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StandardMaskedInputComponent),
    multi: true
  }]
})
export class StandardMaskedInputComponent extends BaseMaskedInputComponent
    implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, ValidationDetailed {

  // свойства из base-masked-input кроме 'invalid' который заменен 'validation'
  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public id?: string;
  @Input() public contextClass?: string;  // класс-маркер разметки для deep стилей
  @Input() public placeholder?: string;
  @Input() public autocomplete?: InputAutocomplete | string;
  @Input() public clearable = false;
  @Input() public uppercase = false;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;
  @Input() public commitOnInput = true;  // коммитить ли значение по input или по change
  @Input() public removePlaceholderSymbols = true;  // убирать ли символы плейсхолдера из значения перед коммитом
  @Input() public mask: (value: string) => Array<string> | Array<string | RegExp>;
  @Input() public showConstantMaskSymbols = true;
  @Input() public placeholderSymbol = '_';
  @Input() public keepCharPositions = true;
  @Input() public showMaskAsPlaceholder = false;
  @Input() public formatter?: (value: string) => false | string | object;

  // новые свойства для standard-masked-input
  @Input() public invalid = false;
  @Input() public validation: boolean | string | ValidationErrors;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public validationMessages: string | PipedMessage | ValidationMessages = null;
  @Input() public questionTip?: string;
  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;
  @Input() public containerOverlap = false;

  @Output() public focus = new EventEmitter();
  @Output() public blur = new EventEmitter();
  @Output() public cleared = new EventEmitter<void>();

}



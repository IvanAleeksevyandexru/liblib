import { Component, ViewChild, Input, Output, ElementRef, EventEmitter,
  OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlainInputComponent } from '../plain-input/plain-input.component';
import { PipedMessage } from '../../models/piped-message';
import { InputAutocomplete, TipDirection } from '../../models/common-enums';
import { Focusable } from '../../services/focus/focus.manager';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'lib-standard-input',
  templateUrl: 'standard-input.component.html',
  styleUrls: ['./standard-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StandardInputComponent),
    multi: true
  }]
})
export class StandardInputComponent extends PlainInputComponent
  implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, ValidationDetailed {

  // все свойства из plain-input кроме 'invalid' которое заменено 'validation'
  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public type?: string;
  @Input() public contextClass?: string;
  @Input() public maxlength?: string | number;
  @Input() public placeholder?: string;
  @Input() public autocomplete?: InputAutocomplete | string;
  @Input() public tabIndex?: string | number;
  @Input() public readOnly?: boolean;
  @Input() public disabled?: boolean;
  @Input() public multiline?: boolean;
  @Input() public commitOnInput = true;
  @Input() public clearable = false;
  @Input() public uppercase = false;

  // новые свойства для standard-input
  @Input() public invalid = false;
  @Input() public validation: boolean | string | ValidationErrors;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public validationMessages: string | PipedMessage | ValidationMessages = null;
  @Input() public questionTip?: string;
  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;
  @Input() public containerOverlap = false;

  @Output() public cleared = new EventEmitter<void>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();

  public passwordVisible = false; // for password field only

  public switchPasswordMode() {
    this.passwordVisible = !this.passwordVisible;
  }

}

import { Component, ViewChild, Input, Output, ElementRef, EventEmitter,
  OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlainInputComponent } from '../plain-input/plain-input.component';
import { PipedMessage } from '../../models/piped-message';
import { InputAutocomplete, TipDirection, MessagePosition } from '../../models/common-enums';
import { Focusable } from '../../services/focus/focus.manager';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';
import { Width } from '../../models/width-height';

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
  @Input() public width?: Width | string;

  // информационная подсказка
  @Input() public questionTip?: string;
  // позиция вывода информации: типом или отдельным блоком над/под контролом
  @Input() public questionTipPosition: string | MessagePosition = MessagePosition.INSIDE;
  // позиция вывода ошибки: типом или отдельным блоком над/под контролом
  @Input() public validationPosition: string | MessagePosition = MessagePosition.INSIDE;
  // описывает не валидность в терминах true/false, работает только совместно с подсветкой
  @Input() public invalid = false;
  // более полная валидация, пригодная для рендера текста ошибок, отменяет значение invalid если задана
  @Input() public validation: boolean | string | Array<string> | ValidationErrors | { [key: string]: any };
  // когда показывать некорректность поля (как правило начальное пустое поле не считается корректным, но отображать это не нужно)
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  // сообщения валидации вместе с параметрами вывода, работает только совместно с validation
  @Input() public validationMessages: string | PipedMessage | ValidationMessages | { [key: string]: string | PipedMessage} = null;
  // определяет должна ли валидация скрывать информационный тип (показываться вместо) или показываться в дополнение
  @Input() public validationOverride = true;
  // направление бабблов информации-ошибки, для MessagePosition.INSIDE
  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;
  // перекрытие бабблами ограничивающего контейнера, для MessagePosition.INSIDE
  @Input() public containerOverlap = false;

  @Output() public cleared = new EventEmitter<void>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();

  public passwordVisible = false; // скрытие пароля звездочками для type password
  public MessagePosition = MessagePosition;

  public switchPasswordMode() {
    this.passwordVisible = !this.passwordVisible;
  }

}

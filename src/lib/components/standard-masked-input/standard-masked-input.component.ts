import { Component, ViewChild, Input, Output, EventEmitter,
  OnInit, AfterViewInit, DoCheck, OnChanges, OnDestroy, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, ValidationErrors, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseMaskedInputComponent } from '../base-masked-input/base-masked-input.component';
import { Focusable } from '../../services/focus/focus.manager';
import { PipedMessage } from '../../models/piped-message';
import { InputAutocomplete, TipDirection, MessagePosition } from '../../models/common-enums';
import { ValidationDetailed, ValidationShowOn, ValidationMessages } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';
import { Width } from '../../models/width-height';

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
  @Input() public width?: Width | string;

  @Input() public removePlaceholderSymbols = true;  // убирать ли символы плейсхолдера из значения перед коммитом
  @Input() public mask: (value: string) => Array<string> | Array<string | RegExp>;
  @Input() public showConstantMaskSymbols = true;
  @Input() public placeholderSymbol = '_';
  @Input() public keepCharPositions = true;
  @Input() public showMaskAsPlaceholder = false;
  @Input() public formatter?: (value: string) => false | string | object;

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

  @Output() public focus = new EventEmitter();
  @Output() public blur = new EventEmitter();
  @Output() public cleared = new EventEmitter<void>();

  public MessagePosition = MessagePosition;
}



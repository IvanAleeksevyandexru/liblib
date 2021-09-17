import {
  Component, ViewChild, Input, Output, ElementRef, EventEmitter, OnInit, DoCheck,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges, forwardRef, ChangeDetectorRef, Optional, Host, SkipSelf, ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { conformToMask, createTextMaskInputElement } from 'text-mask-core';
// раскомментировать для детальной отладки
/*import * as conformTo from '../../../../../../node_modules/text-mask-core/src/conformToMask';
const conformToMask = conformTo.default;
import * as createTextMask from '../../../../../../node_modules/text-mask-core/src/createTextMaskInputElement';
const createTextMaskInputElement = createTextMask.default; */
import { InputAutocomplete, RemoveMaskSymbols } from '../../models/common-enums';
import { FocusManager, Focusable } from '../../services/focus/focus.manager';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { Width } from '../../models/width-height';
import { Suggest, SuggestItem } from '../../models/suggest';
import { LoadService } from '../../services/load/load.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-base-masked-input',
  templateUrl: 'base-masked-input.component.html',
  styleUrls: ['./base-masked-input.component.scss', '../plain-input/plain-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BaseMaskedInputComponent),
    multi: true
  }]
})
export class BaseMaskedInputComponent
  implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    private focusManager: FocusManager,
    private changeDetection: ChangeDetectorRef,
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer,
    public loadService: LoadService) {}

  // компонент обертка для for ngx-mask, см детали тут https://www.npmjs.com/package/ngx-mask

  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public id?: string;
  @Input() public contextClass?: string; // маркировочный класс для deep стилей
  @Input() public placeholder?: string;
  @Input() public autocomplete?: InputAutocomplete | string;
  @Input() public clearable = false;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;
  @Input() public commitOnInput = true;  // коммитить значение по input или по change
  @Input() public removeMaskSymbols: RemoveMaskSymbols | string = RemoveMaskSymbols.PLACEHOLDERS;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public uppercase = false;
  @Input() public width?: string | Width;
  @Input() public suggest?: Suggest;
  @Input() public suggestSeparator = ' ';

  // маска - это массив символов и/или регэкспов, каждый ответственен за свой символ в поле
  // пример: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
  @Input() public mask: (value: string) => Array<string | RegExp> | Array<string | RegExp>;
  // позиция курсора при получении фокуса
  @Input() public positionInInput = 0;
  // если true показывает и плейсхолдер-символы и константные символы
  // иначе не показывает символы до тех пор пока до них не добралась позиция ввода
  @Input() public showConstantMaskSymbols = true;
  @Input() public placeholderSymbol = '_';
  // когда true ввод/удаление символов не влияет на оставшуюся часть строки
  // когда false ввод/удаление символов в середине строки сдвигает символы в данном блоке (до след фиксированного символа или конца)
  @Input() public keepCharPositions = false;
  // конвертирует маску в плейсхолдер и показывает его переопределяя свойство placeholder
  @Input() public showMaskAsPlaceholder = false;
  // дает возможность изменить уже принятую к показу строку в момент ввода до вывода ее в инпут
  // formatter должен возвращать одно из следующего: false, string, or object
  // верните false для отмены ввода текущего символа и блокирования текущего значения
  // если formatter изменяет строку без вставки новых символов, например
  // капитализирует строку или удаляет символы, то допустимо вернуть измененную строку
  // если же добавляет новые символы, то должен быть возвращен объект следующей структуры:
  // value: измененная строка
  // indexesOfPipedChars: массив позиций измененных/добавленных символов
  @Input() public formatter?: (value: string) => false | string | object;

  @Output() public focus = new EventEmitter();
  @Output() public blur = new EventEmitter();
  @Output() public cleared = new EventEmitter<void>();
  @Output() public selectSuggest = new EventEmitter<Suggest | SuggestItem>();

  @ViewChild('input') private inputElement: ElementRef;

  public focused = false;
  public touched = false;
  public empty = true;
  public destroyed = false;
  public invalidDisplayed = false;
  public control: AbstractControl;
  private lastModelValue = '';
  private valueOnFocus = '';
  private emptyMaskedValue = '';
  private textMaskInputElement: any = null;

  private composing = false;

  private onTouchedCallback: () => void;
  private commit(value: string) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  public ngAfterViewInit() {
    this.setupMask();
    this.attemptToApplyValue(this.lastModelValue);
    this.focusManager.register(this);
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'mask':
        case 'showConstantMaskSymbols':
        case 'placeholderSymbol':
        case 'keepCharPositions':
        case 'showMaskAsPlaceholder':
        case 'formatter': {
          this.setupMask();
        }
      }
    }
    this.check();
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public ngOnDestroy() {
    this.focusManager.unregister(this);
    this.destroyed = true;
  }

  public update() {
    this.setupMask();
    this.check();
  }

  public handleInput(value: string, e?: Event) {
    if (!this.composing) {
      if (this.showMaskAsPlaceholder && value.indexOf(this.emptyMaskedValue) > 0) {
        value = value.replace(this.emptyMaskedValue, '');
      }
      this.attemptToApplyValue(value);
      if (this.commitOnInput) {
        setTimeout(() => {
          const possiblyChangedValue = this.removeMaskSymbolsIfNeeded(this.inputElement.nativeElement.value);
          this.commit(possiblyChangedValue);
        });
      }
    }
    this.check();
  }

  public handleChange(value: string, e?: Event) {
    this.attemptToApplyValue(value);
    if (this.commitOnInput) {
      this.commit(this.removeMaskSymbolsIfNeeded(value));
    }
    this.check();
  }

  public forceChange() {
    if (this.inputElement) {
      this.inputElement.nativeElement.dispatchEvent(HelperService.createEvent('change', true, false));
    }
  }

  public setTouched(touched: boolean) {
    this.touched = touched;
  }

  public notifyFocusEvent(e: Event) {
    const inp = this.inputElement.nativeElement;

    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
    const valueChangedOnBlur = e.type !== 'focus' && inp.value !== this.valueOnFocus;
    if ((HelperService.isSafari() || HelperService.isIE()) && valueChangedOnBlur) {
      this.forceChange();
    }

    if (e.type === 'focus' && !this.removeMaskSymbolsIfNeeded(inp.value) && inp.setSelectionRange) {
      setTimeout(() => {
        inp.setSelectionRange(0, 0);
      });
    }
  }

  public handleClick(evt: Event): void {
    setTimeout(() => {
      this.loseFocus();
      this.returnFocus();
    });
  }

  public handleBlur() {
    this.focused = false;
    this.check();
    this.blur.emit();
    this.changeDetection.detectChanges();
  }

  public handleFocus() {
    this.touched = this.focused = true;
    if (this.keepCharPositions) {
      HelperService.resetSelection(this.inputElement.nativeElement, this.emptyMaskedValue, this.positionInInput);
    }
    this.valueOnFocus = this.inputElement.nativeElement.value;
    this.check();
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.focus.emit();
  }

  public compositionStart() {
    this.composing = true;
  }

  public compositionEnd(value: string) {
    this.composing = false;
    this.handleInput(value);
  }

  public returnFocus(e?: Event) {
    let isSuggest;
    if (e) {
      const target = e.target as HTMLTextAreaElement;
      isSuggest = target?.offsetParent?.classList.contains('suggests');
    }

    if (this.inputElement && this.inputElement.nativeElement && (!e || e.target !== this.inputElement.nativeElement) && !isSuggest) {
      this.inputElement.nativeElement.focus();
      if (this.keepCharPositions) {
        HelperService.resetSelection(this.inputElement.nativeElement, this.emptyMaskedValue, this.positionInInput);
      }
      this.focusManager.notifyFocusMayChanged(this, true);
    }
  }

  public loseFocus() {
    this.inputElement.nativeElement.blur();
  }

  public writeValue(value: string | number) {
    this.lastModelValue = value === null || value === undefined ? '' : '' + value;
    this.attemptToApplyValue(this.lastModelValue);
    this.check();
    if (!this.destroyed) {
      this.changeDetection.detectChanges();
    }
  }

  public clearValue(e: Event) {
    if (!this.disabled) {
      this.writeValue(null);
      this.commit(null);
      this.cleared.emit();
      this.returnFocus(e);
    }
    e.stopPropagation();
    this.check();
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.check();
    if (!this.destroyed) {
      this.changeDetection.detectChanges();
    }
  }

  public check(): void {
    this.invalidDisplayed = ValidationHelper.checkValidation(this);
  }

  private removeMaskSymbolsIfNeeded(value: string) {
    if (value && this.removeMaskSymbols === RemoveMaskSymbols.PLACEHOLDERS) {
      return value.replace(new RegExp(this.placeholderSymbol, 'g'), '');
    } else if (value && this.removeMaskSymbols === RemoveMaskSymbols.TRIM_END) {
      const matchEnd = HelperService.findMatchEnd(value, this.emptyMaskedValue);
      return (value || '').substring(matchEnd);
    } else {
      return value;
    }
  }

  private setupMask() {
    if (this.inputElement && this.inputElement.nativeElement) {
      const config = this.createMaskConfig();
      this.textMaskInputElement = createTextMaskInputElement(
        Object.assign({ inputElement: this.inputElement.nativeElement }, config));
      this.emptyMaskedValue = conformToMask('', this.mask, config).conformedValue;
    }
  }

  private createMaskConfig() {
    return {
      mask: this.mask,
      guide: this.showConstantMaskSymbols,
      placeholderChar: this.placeholderSymbol,
      keepCharPositions: this.keepCharPositions,
      pipe: this.formatter,
      showMask: this.showMaskAsPlaceholder
    };
  }

  private attemptToApplyValue(rawOrMaskedValue: string) {
    if (!this.destroyed) {
      if (this.textMaskInputElement) {
        this.textMaskInputElement.update(rawOrMaskedValue);
      }
      const viewValue = this.textMaskInputElement && this.textMaskInputElement.state.previousConformedValue;
      this.empty = !viewValue || viewValue === this.emptyMaskedValue;
      this.changeDetection.detectChanges();
    }
  }

  public selectSuggestItem(item: SuggestItem): void {
    this.selectSuggest.emit(item);
    this.loseFocus();
  }

  public editSuggestList(suggest: Suggest): void {
    suggest.isEdit = true;
    this.selectSuggest.emit(suggest);
  }

}

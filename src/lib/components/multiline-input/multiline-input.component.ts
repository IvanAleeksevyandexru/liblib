import {
  Component, ViewChild, Input, Output, ElementRef, EventEmitter, SimpleChanges, forwardRef,
  OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, Optional, Host, SkipSelf
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusManager, Focusable } from '../../services/focus/focus.manager';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { HelperService } from '../../services/helper/helper.service';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';

@Component({
  selector: 'lib-multiline-input',
  templateUrl: 'multiline-input.component.html',
  styleUrls: ['./multiline-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultilineInputComponent),
    multi: true
  }]
})
export class MultilineInputComponent
    implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(protected focusManager: FocusManager, @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  @Input() public contextClass?: string;  // класс-маркер разметки для deep стилей
  @Input() public id?: string;
  @Input() public formControlName?: string;
  @Input() public placeholder?: string;
  @Input() public tabIndex?: string | number;
  @Input() public readOnly?: boolean;
  @Input() public disabled?: boolean;
  @Input() public maxlength: number;
  @Input() public commitOnInput = false;  // коммитить ли значение по input или по change
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public minHeight = 77;
  @Input() public maxHeight = 200;
  @Input() public fullHeightScroll = true;

  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();
  @ViewChild('input') protected inputElement: ElementRef;

  public htmlValue = '';
  public textValue = '';

  public awaitingPastedText = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public symbolsCount = 0;
  public control: AbstractControl;

  private onTouchedCallback: () => void;

  protected commit(value: string) {
  }

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
    this.scrollContainer().querySelector('.ps__thumb-y').tabIndex = -1;
    if (HelperService.isIE()) {
      this.inputElement.nativeElement.addEventListener('textinput', this.handleInput.bind(this));
      this.inputElement.nativeElement.addEventListener('keyup', this.handleInput.bind(this));
    }
    this.check();
  }

  public ngOnChanges(changes: SimpleChanges) {
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
  }

  public writeValue(value: string) {
    if (this.maxlength && value) {
      value = value.substring(0, this.maxlength);
    }
    this.setActualTextState(value || '', true);
    this.update(0);
    this.check();
  }

  public notifyFocusEvent(e) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
    if (e.type === 'blur' && !e.target.textContent) {
      this.handleBlur();
    }
  }

  public handleBlur() {
    this.focused = false;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (!this.commitOnInput) {
      this.commit(this.textValue);
    }
    if (this.inputElement.nativeElement.innerHTML === '<br>') {
      this.inputElement.nativeElement.innerHTML = ''; // ff placeholder fix
    }
    this.scrollContainer().scrollTop = 0;
    this.check();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    this.check();
    this.focus.emit();
  }

  public setFocus() {
    this.inputElement.nativeElement.focus();
  }

  public handleKeyPress(e: KeyboardEvent) {
    const symbolicKeyPressed = e.key.length === 1;
    if (this.maxlength && this.symbolsCount === this.maxlength && symbolicKeyPressed) {
      e.preventDefault();
    }
  }

  public handleInput(e: Event) {
    let cancelInput = false;
    if (this.awaitingPastedText) {
      if (HelperService.isIE()) {
        setTimeout(() => this.processPasted(), 100);
      } else {
        this.processPasted();
      }
    } else {
      cancelInput = this.setActualTextState(this.getText(), false) > 0;
    }
    if (cancelInput) {
      this.update(this.getCaretPositionFromEnd());
    } else if (this.commitOnInput) {
      this.commit(this.textValue);
    }
    this.check();
  }

  public handlePaste(e: Event) {
    const pasteNonEmpty = HelperService.isIE() || (e as ClipboardEvent).clipboardData.getData('Text').length;
    if (pasteNonEmpty) {
      this.awaitingPastedText = true;
    }
  }

  // этот метод необходим чтоб заблокировать вставку html, например принтскрина или текста с форматированием
  public processPasted() {
    this.awaitingPastedText = false;
    const truncatedChars = this.setActualTextState(this.getText(), true);
    const expectedHtml = this.createHTML();
    const factHtml = this.inputElement && this.inputElement.nativeElement.innerHTML;
    if (truncatedChars || expectedHtml !== factHtml) {
      const newCaretPosition = this.getCaretPositionFromEnd() - truncatedChars;
      this.update(Math.max(0, newCaretPosition));
    }
  }

  public update(caretPositionFromEnd = 0) {
    this.htmlValue = this.createHTML();
    if (this.inputElement) {
      // есть некоторые проблемы с обновлением innerHTML когда много раз вставляется форматированная строка
      // нужен прямой апдейт вместо detectChanges();
      const scrollContainer = this.scrollContainer();
      const scrollPos = scrollContainer ? scrollContainer.scrollTop : -1;
      this.inputElement.nativeElement.innerHTML = this.htmlValue;
      setTimeout(() => {
        this.setFocus();
        if (scrollPos >= 0) {
          this.scrollContainer().scrollTop = scrollPos;
        }
        if (caretPositionFromEnd >= 0) {
          this.setCaretPositionFromEnd(this.inputElement.nativeElement, caretPositionFromEnd);
        }
      });
    }
  }

  public setActualTextState(textState: string, cancelOrTrimOverflowBehaviour: boolean): number {
    if (this.maxlength && textState && textState.length > this.maxlength) {
      if (cancelOrTrimOverflowBehaviour) {
        // обрезка ввода с конца
        this.textValue = textState.substring(0, this.maxlength);
      } else {
        // отмена ввода, ничего не делать!
      }
      this.symbolsCount = (this.textValue || '').length;
      // количество символов обрезанных с конца
      return textState.length - this.maxlength;
    } else {
      this.textValue = textState;
      this.symbolsCount = (textState || '').length;
      return 0;
    }
  }

  public getCaretPositionFromEnd() {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const selectionRange = selection.getRangeAt(0);
        if (this.inputElement.nativeElement.contains(selectionRange.commonAncestorContainer)) {
          let node = selectionRange.commonAncestorContainer;
          let caretPos = node.textContent.length - selectionRange.endOffset;
          // считаем длины текстов всех далее идущих сиблингов всех уровней вверх до инпута
          while (node !== this.inputElement.nativeElement) {
            const upperParent = node.parentNode;
            let childIndex = upperParent.childNodes.length - 1;
            while (upperParent.childNodes[childIndex] as Node !== node as Node) {
              caretPos += upperParent.childNodes[childIndex].textContent.length;
              childIndex--;
            }
            node = upperParent;
          }
          return caretPos;
        }
      }
    }
    return -1;
  }

  public setCaretPositionFromEnd(node: Node, caretPositionFromEnd: number) {
    if (window.getSelection && document.createRange) {
      if (node.textContent.length > caretPositionFromEnd) {
        let offsetRest = caretPositionFromEnd;
        let offset = caretPositionFromEnd;
        let index = node.childNodes.length - 1;
        // идем по всем сиблингам чтобы найти тот на котором накопленное количество символов с конца будет исчерпано
        while (offset >= 0 && index >= 0) {
          const nodeLength = node.childNodes[index].textContent.length;
          offsetRest = offset; // необходимое смещение на один шаг позади
          offset -= nodeLength;
          index--;
        }
        const lookedUpNode = node.childNodes[++index];
        if (lookedUpNode.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.setStart(lookedUpNode, lookedUpNode.textContent.length - offsetRest);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          this.setCaretPositionFromEnd(lookedUpNode, offsetRest);
        }
      }
    }
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
  }

  public check(): void {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !this.textValue});
  }

  private scrollContainer() {
    if (this.inputElement && this.inputElement.nativeElement) {
      const scrollContainer = this.inputElement.nativeElement.parentElement.parentElement;
      return scrollContainer.classList.contains('ps') ? scrollContainer : null;
    }
    return null;
  }

  // HelperService.htmlToText не подходи потому что не предохраняет разрывы строк
  private getText() {
    let html = this.inputElement.nativeElement.innerHTML;
    if (!html.startsWith('<div>')) {
      html = html.replace(/<div>/, '\n'); // первому диву может предшествовать текстовая нода
    }
    html = html.replace(/<br>/g, '\n');  // brs -> \n
    html = html.replace(/<br\/>/, '\n');
    html = html.replace(/<div>\n<\/div>/g, '\n'); // divs содержащие только br -> \n
    html = html.replace(/<div>/g, ''); // начало див элементов дропается
    html = html.replace(/<\/div>/g, '\n'); // концы -> \n
    html = html.replace(/\n*$/, ''); // концевые избыточные \n обрезаются
    // близко к окончательному, но еще может содержать не вырезанные хтмл куски, чистим
    return HelperService.htmlToText(html); // не уничтожает \n внутри строк
  }

  private createHTML() {
    const value = this.textValue;
    if (!value) {
      return '';
    }
    let result = '';
    let rest = value;
    rest = rest.replace(/&/g, '&amp;');
    while (rest.includes('\n')) { // восстанавливаем исходную div/br структуру
      if (rest.indexOf('\n') === 0) {
        result += '<div><br/></div>';
        rest = rest.substring(1);
      } else {
        result += '<div>' + rest.substring(0, rest.indexOf('\n')) + '</div>';
        rest = rest.substring(rest.indexOf('\n') + 1);
      }
    }
    result += '<div>' + rest + '</div>';
    return result;
  }

}

import {
  Component, ViewChild, Input, Output, ElementRef, EventEmitter, SimpleChanges, forwardRef, HostBinding,
  OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, Optional, Host, SkipSelf, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputAutocomplete } from '../../models/common-enums';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { FocusManager, Focusable } from '../../services/focus/focus.manager';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { HelperService } from '../../services/helper/helper.service';
import { Width } from '../../models/width-height';
import { Suggest, SuggestItem } from '../../models/suggest';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-plain-input',
  templateUrl: 'plain-input.component.html',
  styleUrls: ['./plain-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PlainInputComponent),
    multi: true
  }]
})
export class PlainInputComponent
  implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    protected focusManager: FocusManager,
    private changeDetection: ChangeDetectorRef,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  public value = '';

  // name используется для назначения аттрибуту, но чтобы связать контрол с формой - используйте formControlName
  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public type?: string; // password, email, number итд
  @Input() public contextClass?: string;  // класс разметки для deep стилей
  @Input() public minlength?: string | number;
  @Input() public maxlength?: string | number;
  @Input() public placeholder?: string;
  @Input() public autocomplete?: InputAutocomplete | string;
  @Input() public tabIndex?: string | number;
  @Input() public readOnly?: boolean;
  @Input() public disabled?: boolean;
  @Input() public multiline?: boolean;
  @Input() public commitOnInput = true;  // коммитить по input или по change
  @Input() public clearable = false;
  @Input() public uppercase = false;
  @Input() public width?: Width | string;
  @Input() public suggest?: Suggest;

  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  // focus и blur искусственные, одноименные с естественными, остальные события просто всплывают
  @Output() public cleared = new EventEmitter<void>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();
  @Output() public selectSuggest = new EventEmitter<Suggest | SuggestItem>();
  // эти события не перехватываются и всплывают:
  // input, change, keydown, keyup, keypress, click, dblclick, touchstart, touchend,
  // touchmove, mousedown, mouseup, mouseenter, mouseleave, mouseover, mouseout, mousemove

  private destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control: AbstractControl;
  @ViewChild('input') protected inputElement: ElementRef<HTMLInputElement>;

  @HostBinding('attr.id')
  public externalId = '';

  @Input()
  set id(value: string) {
    this._ID = value;
    this.externalId = null;
  }

  get id() {
    return this._ID;
  }

  private _ID = '';

  private onTouchedCallback: () => void;
  protected commit(value: string) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
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
    this.destroyed = true;
    this.focusManager.unregister(this);
  }

  public writeValue(value: string | number) {
    this.value = value === null || value === undefined ? '' : '' + value;
    if (this.multiline && this.inputElement) {
      this.inputElement.nativeElement.value = this.value;
    }
    this.check();
    this.changeDetection.detectChanges();
  }

  public clearValue(e: Event) {
    if (!this.disabled) {
      this.writeValue(null);
      this.commit(null);
      this.cleared.emit();
      this.returnFocus(e);
    }
    e.stopPropagation();
  }

  public notifyFocusEvent(e: Event) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleBlur() {
    this.focused = false;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.check();

    this.blur.emit();
    this.changeDetection.detectChanges();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    if (this.inputElement && this.inputElement.nativeElement && (!e || e.target !== this.inputElement.nativeElement)) {
      this.inputElement.nativeElement.focus();
      HelperService.resetSelection(this.inputElement.nativeElement);
    }
  }

  public handleInput(e: Event) {
    this.value = this.inputElement.nativeElement.value;
    if (this.commitOnInput) {
      this.commit(this.value);
    }
    this.check();
  }

  public handleChange(e: Event) {
    this.value = this.inputElement.nativeElement.value;
    if (!this.commitOnInput) {
      this.commit(this.value);
    }
    this.check();
  }

  public forceChange() {
    if (this.inputElement) {
      this.inputElement.nativeElement.dispatchEvent(HelperService.createEvent('change', true, false));
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
    if (!this.destroyed) {
      this.changeDetection.detectChanges();
    }
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !!this.value});
  }

  public selectSuggestItem(item: SuggestItem): void {
    this.selectSuggest.emit(item);
  }

  public editSuggestList(suggest: Suggest): void {
    suggest.isEdit = true;
    this.selectSuggest.emit(suggest);
  }
}

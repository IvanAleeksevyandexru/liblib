import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationHelper } from '@epgu/ui/services/validation-helper';
import { Validated } from '@epgu/ui/models/validation-show';
import { Focusable, FocusManager } from '@epgu/ui/services/focus';
import { ValidationShowOn } from '@epgu/ui/models/common-enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements OnInit, ControlValueAccessor, Validated, Focusable, AfterViewInit, OnDestroy {

  public static idCounter = 1;

  @Input() public checkboxId: string; // input ID: если не указан, генерируется уникальный ID
  @Input() public labelText: string;
  @Input() public description: string;
  @Input() public errorMessage: string;
  @Input() public required = false;
  @Input() public disabled: boolean;
  @Input() public checked: boolean;

  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  public invalidDisplayed: boolean;
  public focused: boolean;
  private destroyed = false;
  private modelInitialization = true;
  private onTouchedCallback: () => void;

  private commit(value: any) {
  }

  constructor(
    private focusManager: FocusManager,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  public ngOnInit() {
    // генеририрует уникальный ID, если не указан checkboxId
    if (!this.checkboxId) {
      this.checkboxId = 'app-checkbox-' + CheckboxComponent.idCounter++;
    }
  }

  public ngAfterViewInit(): void {
    this.focusManager.register(this);
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this.focusManager.unregister(this);
  }

  public onChecked(value: boolean) {
    this.checked = value;
    this.check();
    this.commit(value);
  }

  // ControlValueAccessor methods
  public writeValue(value: any) {
    const isInitialization = this.modelInitialization;
    this.modelInitialization = false;
    if (this.checked !== undefined && value === undefined && isInitialization) {
      return; // управление @Input свойством, переинициализация моделью возможна только реальным значением
    }
    this.checked = !!value;
    if (!this.destroyed) {
      this.changeDetector.detectChanges();
    }
  }

  public registerOnChange(func: any) {
    this.commit = func;
  }

  public registerOnTouched(func: any) {
    this.onTouchedCallback = func;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.check();
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {touched: true});
  }

  public notifyFocusEvent(e: Event): void {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleFocus(): void {
    this.focused = true;
  }

  public handleBlur(): void {
    this.focused = false;
  }

}

import { Component, forwardRef, Input, OnInit, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationShowOn } from '../../models/common-enums';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { Validated } from '../../models/validation-show';

@Component({
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
export class CheckboxComponent implements OnInit, ControlValueAccessor, Validated {

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
  private modelInitialization = true;
  private onTouchedCallback: () => void;
  private commit(value: any) {}

  constructor() { }

  public ngOnInit() {
    // генеририрует уникальный ID, если не указан checkboxId
    if (!this.checkboxId) {
      this.checkboxId = 'app-checkbox-' + CheckboxComponent.idCounter++;
    }
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

}

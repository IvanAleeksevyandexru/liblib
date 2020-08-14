import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ]
})
export class RadioComponent implements OnInit, ControlValueAccessor {
  public static idCounter = 1;

  @Input() public radioId: string; // input ID: если не указан, генерируется уникальный ID
  @Input() public disabled = false; // состояние: по умолчанию - активное
  @Input() public labelText: string;
  @Input() public description: string;
  @Input() public errorMessage: string;
  @Input() public required = false;
  @Input() public name: string;
  @Input() public value: string;
  @Input() public checked: boolean;

  public propagateChange = (value: any) => {};
  public onTouchedCallback = () => {};

  constructor() { }

  public ngOnInit() {
    // генеририрует уникальный ID, если не указан radioId
    if (!this.radioId) {
      this.radioId = 'app-radio-' + RadioComponent.idCounter++;
    }
  }

  public onChanged(event) {
    this.propagateChange(event.target.value);
    this.writeValue(this.value);
  }

  // ControlValueAccessor methods
  public writeValue(value: any) {
  }

  public registerOnChange(func: any) {
    this.propagateChange = func;
  }

  public registerOnTouched(func: any) {
    this.onTouchedCallback = func;
  }

}

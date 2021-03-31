import {
  Component,
  forwardRef,
  Input,
  Output,
  OnInit,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Focusable, FocusManager } from '../../services/focus/focus.manager';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class RadioComponent implements OnInit, ControlValueAccessor, Focusable, AfterViewInit, OnDestroy {

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
  @Input() public labelColor = '#000';

  @Output() public changed = new EventEmitter<string>();

  public focused: boolean;
  private modelInitialization = true;
  private onTouchedCallback: () => void;
  private commit(value: any) {}

  constructor(
    private focusManager: FocusManager,
    private changeDetector: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    // генеририрует уникальный ID, если не указан radioId
    if (!this.radioId) {
      this.radioId = 'app-radio-' + RadioComponent.idCounter++;
    }
  }

  public ngAfterViewInit(): void {
    this.focusManager.register(this);
  }

  public ngOnDestroy(): void {
    this.focusManager.unregister(this);
  }

  public onSelected(value: boolean) {
    // всегда true, но вызывается только для активного
    this.checked = value;
    // для остальных из данной группы синхронизация произойдет через модель
    this.commit(this.value);
    this.changed.emit(this.value);
  }

  // ControlValueAccessor methods
  public writeValue(value: string) {
    const isInitialization = this.modelInitialization;
    this.modelInitialization = false;
    if (this.checked !== undefined && value === undefined && isInitialization) {
      return; // управление @Input свойством, переинициализация моделью возможна только реальным значением
    }
    this.checked = value === this.value;
    this.changeDetector.detectChanges();
  }

  public registerOnChange(func: any) {
    this.commit = func;
  }

  public registerOnTouched(func: any) {
    this.onTouchedCallback = func;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  public notifyFocusEvent(e: Event, id): void {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleFocus(): void {
    this.focused = true;
  }

  public handleBlur(): void {
    this.focused = false;
  }
}

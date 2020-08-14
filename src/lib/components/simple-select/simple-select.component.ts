import { Component, Input, Output, ViewChild, ElementRef,
  EventEmitter, ChangeDetectorRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { ListItem } from '../../models/dropdown.model';
import { Translation } from '../../models/common-enums';

@Component({
  selector: 'lib-simple-select',
  templateUrl: 'simple-select.component.html',
  styleUrls: ['./simple-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SimpleSelectComponent),
    multi: true
  }]
})
export class SimpleSelectComponent implements ControlValueAccessor {

  constructor(private changeDetector: ChangeDetectorRef) {}

  @Input() public name?: string;
  @Input() public contextClass?: string;
  @Input() public disabled = false;
  @Input() public translation: Translation | string = Translation.NONE;

  @Input() public list: Array<ListItem> = [];
  @Input() public item: ListItem = null;

  @Output() private changed = new EventEmitter<any>();
  @Output() private open = new EventEmitter<any>();

  public expanded = false;
  public Translation = Translation;

  @ViewChild('container') public container: ElementRef;
  @ViewChild('scrollComponent') private scrollComponent: PerfectScrollbarComponent;

  private commit: (value: ListItem) => void;
  private onTouchedCallback: () => void;

  public hide() {
    this.expanded = false;
  }

  public toggle() {
    if (!this.disabled) {
      this.expanded = !this.expanded;
      if (this.expanded) {
        this.open.emit({target: this});
        if (this.onTouchedCallback) {
          this.onTouchedCallback();
        }
        this.changeDetector.detectChanges();
        this.updateScrollBars();
      }
    }
  }

  public select(value: ListItem) {
    this.item = value;
    if (this.commit) {
      this.commit(value);
    }
    this.changed.emit({item: value});
    this.hide();
  }

  public writeValue(value: ListItem) {
    this.item = value;
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  private updateScrollBars() {
    if (this.scrollComponent) {
      this.scrollComponent.directiveRef.update();
    }
  }

}

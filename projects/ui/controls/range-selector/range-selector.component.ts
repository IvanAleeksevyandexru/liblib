import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownSimpleComponent } from '../dropdown-simple';
import { Focusable } from '@epgu/ui/services/focus';
import { Validated } from '@epgu/ui/models/validation-show';
import { Range, RangeListItem, RelativeDate } from '@epgu/ui/models/date-time';
import { DatesHelperService } from '@epgu/ui/services/dates-helper';
import { Translation, ValidationShowOn } from '@epgu/ui/models/common-enums';
import { Width } from '@epgu/ui/models';
import * as moment_ from 'moment';

const moment = moment_;

const STD_DATE_FORMAT = 'DD.MM.YYYY';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-range-selector',
  templateUrl: 'range-selector.component.html',
  styleUrls: ['./range-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RangeSelectorComponent),
    multi: true
  }]
})
export class RangeSelectorComponent extends DropdownSimpleComponent
  implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  // свойства для дропдауна
  @Input() public contextClass?: string;  // класс разметки для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public placeholder = '&mdash;';
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;
  @Input() public translation: Translation | string = Translation.NONE;
  @Input() public items: Array<any> = [];

  // новые свойства непосредственно для RangeSelectorComponent
  // если true, полагаем что значение в модели - listItem и выбранное может матчиться по id
  // если false, значение в модели полагается Range<Date> и соответствие может быть найдено только сравнением дат
  @Input() public listModelValue = false;
  // нужно ли приводить значения границ рейнджа (которое коммитится непосредственно или содержится
  // внутри listItem в зависимости от listModelValue) к тексту или нужна дата
  @Input() public textModelValue = false;
  // свойства для календаря
  @Input() public minDate: Date | RelativeDate | string;
  @Input() public maxDate: Date | RelativeDate | string;

  @Output() public blur = new EventEmitter<any>();
  @Output() public focus = new EventEmitter<any>();
  @Output() public changed = new EventEmitter<any>();

  public internalItems: Array<RangeListItem> = [];
  public currentItem: RangeListItem = null;
  public activeCustomItem: RangeListItem = null;

  public customRangeSelectingMode = false;
  public customRange: Range<Date> | Range<string> = null;
  public Translation = Translation;

  public setItems(value: Array<any>) {
    if (value) {
      this.internalItems = value.map((item: any) => new RangeListItem(item));
    } else {
      this.internalItems = [];
    }
    this.internalItems.forEach((rangeItem) => {
      if (rangeItem.relativeRange) {
        rangeItem.range = DatesHelperService.relativeRangeToRange(rangeItem.relativeRange, this.textModelValue);
      }
    });
    this.checkConsistency();
    this.changeDetector.detectChanges();
  }

  public selectRange(item: RangeListItem) {
    this.returnFocus();
    if (item.customRange) {
      this.customRangeSelectingMode = true;
      this.activeCustomItem = item;
      this.changeDetector.detectChanges();
    } else {
      if (item.selected) {
        return;
      } else {
        // !!! ВНИМАНИЕ изменяем рейндж внутри оригинального (не-кастомного) listItem
        this.customRange = null;
        let outputValue;
        if (this.listModelValue) {
          outputValue = item.originalItem;
          outputValue.range = item.range;
        } else {
          outputValue = item.range;
        }
        this.commit(outputValue);
        this.changed.emit(outputValue);
        this.currentItem = item;
        this.closeDropdown();
      }
    }
    this.check();
    this.changeDetector.detectChanges();
  }

  public closeDropdown() {
    this.activeCustomItem = null;
    this.customRangeSelectingMode = false;
    super.closeDropdown();
  }

  public handleCustomRangeSelectionEnd() {
    if (this.activeCustomItem) {
      this.activeCustomItem.range = this.customRange; // модифицируем внутреннее поле, копию
      this.currentItem = this.activeCustomItem;
      let outputValue;
      if (this.listModelValue) {
        outputValue = this.activeCustomItem.originalItem;
        // !!! ВНИМАНИЕ изменяем рейндж внутри оригинального (кастомного) listItem
        outputValue.range = this.customRange;
      } else {
        outputValue = this.customRange;
      }
      this.commit(outputValue);
      this.changed.emit(outputValue);
    }
    this.closeDropdown();
    this.check();
    this.changeDetector.detectChanges();
  }

  public writeValue(value: Range<Date> | Range<string> | RangeListItem | any) {
    if (value) {
      if (this.listModelValue) {
        const rangeValue = value instanceof RangeListItem ? value as RangeListItem : new RangeListItem(value);
        const selectedValue = rangeValue.findSame(this.internalItems) as RangeListItem || rangeValue;
        if (rangeValue.customRange) {
          if (rangeValue.relativeRange) {
            selectedValue.range = DatesHelperService.relativeRangeToRange(rangeValue.relativeRange, this.textModelValue);
          } else {
            selectedValue.range = rangeValue.range;
          }
        }
        this.currentItem = selectedValue;
      } else {
        const nonCustomItems = (this.internalItems || []).filter((item) => !item.customRange);
        const customItem = (this.internalItems || []).find((item) => item.customRange);
        const selectedNonCustom = nonCustomItems.find((nonCustom) => nonCustom.range.equals(value));
        if (selectedNonCustom) {
          this.currentItem = selectedNonCustom;
        } else if (customItem) {
          customItem.range = value;
          this.currentItem = customItem;
        }
      }
    } else {
      this.currentItem = null;
    }
    this.check();
    this.changeDetector.detectChanges();
  }

  public formatRange(range: Range<Date> | Range<string>) {
    if (!range) {
      return '';
    }
    if (this.textModelValue) {
      return range.start + '-' + range.end;
    } else {
      return moment(range.start).format(STD_DATE_FORMAT) + '-' + moment(range.end).format(STD_DATE_FORMAT);
    }
  }

  private checkConsistency() {
    if (this.currentItem) {
      this.currentItem = (this.internalItems || []).find((internalItem) =>
        this.listModelValue ? internalItem.id === this.currentItem.id : internalItem.range.equals(this.currentItem.range));
    }
  }

}

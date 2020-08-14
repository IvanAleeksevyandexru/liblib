import { Component, OnInit, OnChanges, AfterViewInit, DoCheck, OnDestroy, Input, Output,
  EventEmitter, forwardRef, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { Focusable } from '../../services/focus/focus.manager';
import { Validated, ValidationShowOn } from '../../models/validation-show';
import { RelativeDate, Range, RangeListItem } from '../../models/date-time.model';
import { DatesHelperService } from '../../services/dates-helper/dates-helper.service';
import { Translation } from '../../models/common-enums';
import * as moment_ from 'moment';
const moment = moment_;

const STD_DATE_FORMAT = 'DD.MM.YYYY';

@Component({
  selector: 'lib-range-selector',
  templateUrl: 'range-selector.component.html',
  styleUrls: ['./range-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RangeSelectorComponent),
    multi: true
  }]
})
export class RangeSelectorComponent extends DropdownComponent
    implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated  {

  // свойства для дропдауна
  @Input() public contextClass?: string;  // класс разметки для deep стилей
  @Input() public formControlName?: string;
  @Input() public tabIndex?: string | number;
  @Input() public disabled?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string = ValidationShowOn.TOUCHED;
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
  public internalSelected: Array<RangeListItem> = [];
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
  }

  public selectItem(item: RangeListItem) {
    this.returnFocus();
    if (item.customRange) {
      this.customRangeSelectingMode = true;
      this.activeCustomItem = item;
      this.changeDetector.detectChanges();
    } else {
      if (this.isSelected(item)) {
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
        this.internalSelected = [item];
        this.closeDropdown();
      }
    }
    this.check();
  }

  public closeDropdown() {
    this.activeCustomItem = null;
    this.customRangeSelectingMode = false;
    super.closeDropdown();
  }

  public handleCustomRangeSelectionEnd() {
    if (this.activeCustomItem) {
      this.activeCustomItem.range = this.customRange; // модифицируем внутреннее поле, копию
      this.internalSelected = [this.activeCustomItem];
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
  }

  public writeValue(value: Range<Date> | Range<string> | any) {
    if (value) {
      if (this.listModelValue) {
        const selectedValue = (this.internalItems || []).find((item) => item.id === value.id);
        this.internalSelected = selectedValue ? [selectedValue] : [];
        if (value.customRange && selectedValue.customRange) {
          if (value.relativeRange) {
            selectedValue.range = DatesHelperService.relativeRangeToRange(value.relativeRange, this.textModelValue);
          } else {
            selectedValue.range = value.range;
          }
        }
      } else {
        const nonCustomItems = (this.internalItems || []).filter((item) => !item.customRange);
        const customItem = (this.internalItems || []).find((item) => item.customRange);
        const selectedNonCustom = nonCustomItems.find((nonCustom) => nonCustom.range.equals(value));
        if (selectedNonCustom) {
          this.internalSelected = [selectedNonCustom];
        } else if (customItem) {
          customItem.range = value;
          this.internalSelected = [customItem];
        }
      }
    } else {
      this.internalSelected = [];
    }
    this.check();
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
    this.internalSelected = (this.internalSelected || []).filter((internalSelected) =>
      (this.internalItems || []).find((internalItem) =>
        this.listModelValue ? internalItem.id === internalSelected.id : internalItem.range.equals(internalSelected.range)));
    if (this.internalSelected.length > 1) {
      this.internalSelected = [this.internalSelected[0]];
    }
  }

}

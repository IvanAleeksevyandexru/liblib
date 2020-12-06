import { ListItem } from './dropdown.model';
import { ConstantsService } from '../services/constants.service';
import * as moment_ from 'moment';

const moment = moment_;
const MIN_MONTH = 0;
const MAX_MONTH = 11;
export const MODEL_DATE_FORMAT = ConstantsService.CALENDAR_TEXT_MODEL_FORMAT;
const DATE_PATTERN = /(\d{1, 2})\.(\d{1, 2})\.(\d{1, 4})/;
export const MONTHS_CODES =
    ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY',
    'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
// рейндж для дат от..до из строкового или датного представления, строковый формат всегда дд.мм.гггг
export class Range<T extends Date | string> {

  constructor(start: T, end: T) {
    this.start = start;
    this.end = end;
  }

  public start: T;
  public end: T;

  public static create(value1: Date | string, value2: Date | string, isText = false): Range<string> | Range<Date> {
    const value1Comparable = value1 && ((value1 instanceof Date && !isNaN(value1.getTime())) || DATE_PATTERN.test('' + value1 as string));
    const value2Comparable = value2 && ((value2 instanceof Date && !isNaN(value2.getTime())) || DATE_PATTERN.test('' + value2 as string));
    let minimalValue = value1;
    let maximumValue = value2;
    if (value1Comparable && value2Comparable) {
      const value1AsDate = value1 instanceof Date ? moment(value1) : moment(value1 as string, MODEL_DATE_FORMAT);
      const value2AsDate = value2 instanceof Date ? moment(value2) : moment(value2 as string, MODEL_DATE_FORMAT);
      if (value1AsDate.isAfter(value2AsDate, 'day')) {
        maximumValue = value1;
        minimalValue = value2;
      }
    }
    if (isText) {
      const minStr = minimalValue ? (minimalValue instanceof Date ? moment(minimalValue).format(MODEL_DATE_FORMAT) : minimalValue) : null;
      const maxStr = maximumValue ? (maximumValue instanceof Date ? moment(maximumValue).format(MODEL_DATE_FORMAT) : maximumValue) : null;
      return new Range<string>(minStr, maxStr);
    } else {
      const minDate = minimalValue ?
        (minimalValue instanceof Date ? minimalValue : moment(minimalValue, MODEL_DATE_FORMAT).toDate()) : null;
      const maxDate = maximumValue ?
        (maximumValue instanceof Date ? maximumValue : moment(maximumValue, MODEL_DATE_FORMAT).toDate()) : null;
      return new Range<Date>(minDate, maxDate);
    }
  }

  public isEmpty() {
    return this.start === null && this.end === null;
  }

  public isHalfed() {
    return this.start && !this.end || this.end && !this.start;
  }

  public equals(range: Range<Date> | Range<string>) {
    if (!range) {
      return false;
    }
    let startDatesEqual = false;
    let endDatesEqual = false;
    if (this.start && this.start instanceof Date) {
      startDatesEqual = range.start && moment(range.start).isSame(this.start, 'day');
    } else {
      startDatesEqual = range.start === this.start;
    }
    if (this.end && this.end instanceof Date) {
      endDatesEqual = range.end && moment(range.end).isSame(this.end, 'day');
    } else {
      endDatesEqual = range.end === this.end;
    }
    return startDatesEqual && endDatesEqual;
  }

  public toString() {
    return (this.start || 'xx') + '-' + (this.end || 'xx');
  }
}

export class RelativeDate {

  constructor(text: string) {
    this.text = text;
  }

  public text: string;
}

export interface DateProperties {
  day: number;
  date: Date;
  today?: boolean;
  holiday?: boolean;
  selected?: boolean;
  inRange?: boolean;
  emptyInRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  outer?: boolean;
  locked?: boolean;
  custom?: string;
}

export interface DatePropertiesPublisher {
  publish(dateItem: DateProperties): void;
}

export class MonthYear {
  constructor(month: number, year: number) {
    this.year = year;
    this.month = month;
    this.monthCode = MONTHS_CODES[month];
  }
  public month: number;
  public year: number;
  public monthCode: string;
  public static equals(monthYear1, monthYear2) {
    if (monthYear1 && monthYear2) {
      return monthYear1.month === monthYear2.month && monthYear1.year === monthYear2.year;
    } else {
      return monthYear1 === monthYear2;
    }
  }
  public static fromDate(date: Date) {
    const momentDate = moment(date);
    return new MonthYear(momentDate.month(), momentDate.year());
  }
  public prev(): MonthYear {
    if (this.month === MIN_MONTH) {
      return new MonthYear(MAX_MONTH, this.year - 1);
    } else {
      return new MonthYear(this.month - 1, this.year);
    }
  }
  public next(): MonthYear {
    if (this.month === MAX_MONTH) {
      return new MonthYear(MIN_MONTH, this.year + 1);
    } else {
      return new MonthYear(this.month + 1, this.year);
    }
  }
  public firstDay(): Date {
    return moment({year: this.year, month: this.month, day: 1}).toDate();
  }
  public lastDay(): Date {
    return moment(this.firstDay()).endOf('month').toDate();
  }
}

// range consisting of 2 shifts (same as accepted by calendar) of explicit dates
export class RelativeRange {

  constructor(start: RelativeDate | Date | string, end: RelativeDate | Date | string) {
    if (typeof start === 'string' || start instanceof String) {
      this.start = new RelativeDate(start as string);
    } else {
      this.start = start as Date | RelativeDate;
    }
    if (typeof end === 'string' || end instanceof String) {
      this.end = new RelativeDate(end as string);
    } else {
      this.end = end as Date | RelativeDate;
    }
  }

  public start: RelativeDate | Date;
  public end: RelativeDate | Date;
}

export class RangeListItem extends ListItem {

  constructor(value: any) {
    super(value);
    this.customRange = value.customRange;
    this.range = value.range;
    this.relativeRange = value.relativeRange;
  }

  public customRange: boolean;
  public range: Range<Date> | Range<string>;
  public relativeRange: RelativeRange;

}



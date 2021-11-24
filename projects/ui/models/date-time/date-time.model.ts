import { ListItem } from '@epgu/ui/models/dropdown';
import { endOfMonth, format, getMonth, getYear, isAfter, isSameDay, parse, setYear } from 'date-fns';

const MIN_MONTH = 0;
const MAX_MONTH = 11;
export const MODEL_DATE_FORMAT = 'dd.MM.yyyy';
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
      const value1AsDate = value1 instanceof Date ? value1 : parse(value1 as string, MODEL_DATE_FORMAT, new Date());
      const value2AsDate = value2 instanceof Date ? value2 : parse(value2 as string, MODEL_DATE_FORMAT, new Date());
      if (isAfter(value1AsDate, value2AsDate)) {
        maximumValue = value1;
        minimalValue = value2;
      }
    }
    if (isText) {
      const minStr = minimalValue ? (minimalValue instanceof Date ? format(minimalValue as Date, MODEL_DATE_FORMAT) : minimalValue) : null;
      const maxStr = maximumValue ? (maximumValue instanceof Date ? format(maximumValue as Date, MODEL_DATE_FORMAT) : maximumValue) : null;
      return new Range<string>(minStr, maxStr);
    } else {
      const minDate = minimalValue ?
        (minimalValue instanceof Date ? minimalValue : parse(minimalValue, MODEL_DATE_FORMAT, new Date())) : null;
      const maxDate = maximumValue ?
        (maximumValue instanceof Date ? maximumValue : parse(maximumValue, MODEL_DATE_FORMAT, new Date())) : null;
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
      startDatesEqual = range.start && isSameDay(range.start as Date, this.start);
    } else {
      startDatesEqual = range.start === this.start;
    }
    if (this.end && this.end instanceof Date) {
      endDatesEqual = range.end && isSameDay(range.end as Date, this.end);
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
  inPreviewRange?: boolean;
  rangeStart?: boolean;
  selectionInSiblingMonth?: boolean;
  rangeEnd?: boolean;
  previewRangeStart?: boolean;
  previewRangeEnd?: boolean;
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
    return new MonthYear(getMonth(date), getYear(date));
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
    return new Date(this.year, this.month, 1);
  }
  public lastDay(): Date {
    return endOfMonth(this.firstDay());
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



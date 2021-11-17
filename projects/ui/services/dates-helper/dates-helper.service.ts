import { Injectable } from '@angular/core';
import { Range, RelativeDate, RelativeRange } from '@epgu/ui/models/date-time';
import { HelperService } from '@epgu/ui/services/helper';
import {
  add, differenceInYears,
  endOfMonth, endOfWeek,
  endOfYear, format,
  isAfter,
  isBefore,
  isEqual, parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear, sub
} from 'date-fns';
import { ru } from 'date-fns/locale';

const STD_DATE_FORMAT = 'dd.MM.yyyy';
const TIMESHIFT_JOINED = /\+\d{4}$/;
const RELATIVE_DATE_SHIFT_PATTERN = '[\\+\\-](\\d+y)?(\\d+m)?(\\d+d)?';
const KNOWN_RELATIVE_DATE_BASES: { [name: string]: (key: string) => Date } = {
  today: (fragment: string) => {
    return startOfDay(new Date());
  },
  'start of year': (fragment: string) => {
    return startOfDay(startOfYear(new Date()));
  },
  'start of month': (fragment: string) => {
    return startOfDay(startOfMonth(new Date()));
  },
  'start of week': (fragment: string) => {
    return startOfDay(startOfWeek(new Date()));
  },
  'end of year': (fragment: string) => {
    return startOfDay(endOfYear(new Date()));
  },
  'end of month': (fragment: string) => {
    return startOfDay(endOfMonth(new Date()));
  },
  'end of week': (fragment: string) => {
    return startOfDay(endOfWeek(new Date()));
  },
  '\\d\\d\\.\\d\\d\\.\\d\\d\\d\\d': (fragment: string) => {
    return startOfDay(parse(fragment, 'dd.MM.yyyy', new Date()));
  }
};

@Injectable({
  providedIn: 'root'
})
export class DatesHelperService {

  constructor() {
  }

  public static isRelativeDate(relativeDateText: string) {
    return new RegExp('^' + RELATIVE_DATE_SHIFT_PATTERN + '$').test(relativeDateText) ||
      Object.keys(KNOWN_RELATIVE_DATE_BASES).some((knownBase) => {
        const knownBaseTest = new RegExp('^' + knownBase + '(' + RELATIVE_DATE_SHIFT_PATTERN + ')*$');
        return knownBaseTest.test(relativeDateText);
      });
  }

  public static relativeDateToDate(relativeDate: RelativeDate): Date {
    if (relativeDate === null || !relativeDate.text) {
      return startOfDay(new Date());
    }
    const relativeDateText = relativeDate.text;
    let baseText;
    let shiftText;
    const posSignPos = relativeDateText.indexOf('+');
    const negSignPos = relativeDateText.indexOf('-');
    const firstShiftSignPos = posSignPos === -1 ? negSignPos : negSignPos === -1 ? posSignPos : Math.min(posSignPos, negSignPos);
    if (firstShiftSignPos === -1) {
      baseText = relativeDateText;
      shiftText = '';
    } else {
      baseText = relativeDateText.substring(0, firstShiftSignPos);
      shiftText = relativeDateText.substring(firstShiftSignPos);
    }
    if (!baseText) {
      baseText = 'today';
    }
    const base = Object.keys(KNOWN_RELATIVE_DATE_BASES).find(
      (knownBase) => new RegExp('^' + knownBase + '$').test(baseText));
    if (!base) {
      throw new Error('Invalid Relative Date Format');
    }
    const initialDate = KNOWN_RELATIVE_DATE_BASES[base](baseText);
    if (!shiftText) {
      return initialDate;
    }
    const FULL_SHIFT_PATTERN = new RegExp('^(' + RELATIVE_DATE_SHIFT_PATTERN + ')+$');
    if (!FULL_SHIFT_PATTERN.test(shiftText)) {
      throw new Error('Invalid Relative Date Format');
    }
    const STARTED_FROM_SHIFT_PATTERN = new RegExp('^' + RELATIVE_DATE_SHIFT_PATTERN);
    let result = initialDate;
    let shiftRest = shiftText;
    while (shiftRest) {
      const shiftPart = STARTED_FROM_SHIFT_PATTERN.exec(shiftRest)[0];
      const parseResult = shiftPart.match(RELATIVE_DATE_SHIFT_PATTERN);
      const sign = shiftPart[0] === '+';
      for (let i = 1; i <= 3; i++) {
        const shiftGroup = parseResult[i];
        if (shiftGroup) {
          const value = parseInt(shiftGroup.substring(0, shiftGroup.length - 1), 10) * (sign ? 1 : -1);
          switch (shiftGroup[shiftGroup.length - 1].toUpperCase()) {
            case 'Y': {
              result = add(result, { years: value });
              break;
            }
            case 'M': {
              result = add(result, { months: value });
              break;
            }
            case 'D': {
              result = add(result, { days: value });
              break;
            }
          }
        }
      }
      shiftRest = shiftRest.substring(shiftPart.length);
    }
    return result;
  }

  public static relativeOrFixedToFixed(value: Date | RelativeDate | string) {
    if (value) {
      if (value instanceof Date) {
        return value;
      } else if (value instanceof RelativeDate) {
        return DatesHelperService.relativeDateToDate(value);
      } else if (HelperService.isString(value) && DatesHelperService.isRelativeDate(value)) {
        return DatesHelperService.relativeDateToDate(new RelativeDate(value));
      }
    }
    return null;
  }

  public static isDateWithinRelativeRange(value: Date, range: RelativeRange): boolean {
    const realRange = DatesHelperService.relativeRangeToRange(range, false);
    return value && !isNaN(value.getTime()) && DatesHelperService.isBetween(value, realRange.start as Date, realRange.end as Date);
  }

  public static relativeRangeToRange(relativeRange: RelativeRange, asText: boolean = false): Range<Date> | Range<string> {
    const startDate = relativeRange.start instanceof Date ?
      relativeRange.start : DatesHelperService.relativeDateToDate(relativeRange.start);
    const endDate = relativeRange.end instanceof Date ?
      relativeRange.end : DatesHelperService.relativeDateToDate(relativeRange.end);
    const startDateText = format(startDate, STD_DATE_FORMAT, { locale: ru });
    const endDateText = format(endDate, STD_DATE_FORMAT, { locale: ru });
    return asText ? new Range<string>(startDateText, endDateText) : new Range<Date>(startDate, endDate);
  }

  public static isExpiredDate(date: string, formatStr = 'dd.MM.yyyy'): boolean {
    return isBefore(parse(date, formatStr, new Date()), new Date());
  }

  public static isExpiredDateAfter(date: string, amount: number, units: string): boolean {
    let subtractValue: Duration = {};
    if (["year", "years", "y" ].includes(units)) {
      subtractValue = { years: amount };
    }
    if (["month", "months", "M"].includes(units)) {
      subtractValue = { months : amount };
    }
    if (["week", "weeks", "w"].includes(units)) {
      subtractValue = { weeks : amount };
    }
    if (["day", "days", "d"].includes(units)) {
      subtractValue = { days : amount };
    }
    if (["hour", "hours", "h"].includes(units)) {
      subtractValue = { hours : amount };
    }
    if (["minute", "minutes", "m"].includes(units)) {
      subtractValue = { minutes : amount };
    }
    if (["second", "seconds", "s"].includes(units)) {
      subtractValue = { seconds : amount };
    }
    return DatesHelperService.isExpiredDate(format(sub(parse(date, 'dd.MM.yyyy', new Date()), subtractValue), 'dd.MM.yyyy', { locale: ru }));
  }

  public static alignToLimits(date: Date, minDate: Date, maxDate: Date) {
    if (date && date instanceof Date) {
      if (date < minDate) {
        return minDate;
      } else if (date > maxDate) {
        return maxDate;
      }
    }
    return date;
  }

  public static isoToDate(value: string | Date): Date {
    if (!value || value instanceof Date) {
      return value as Date;
    }
    const str = value as string;
    if (TIMESHIFT_JOINED.test(str)) {
      return new Date(str.substring(0, str.length - 2) + ':' + str.substring(str.length - 2));
    }
    return new Date(str);
  }

  // Метод считает, сколько лет прошло с даты
  public static calcAge(value: string | Date): number {
    if (value) {
      if (value instanceof Date) {
        return differenceInYears(new Date(), value);
      } else if (value.match(/\d{2}\.\d{2}.\d{4}/)) {
        return differenceInYears(new Date(), parse(value as string, 'dd.MM.yyyy', new Date()));
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public static isBetween(target: Date, start: Date, end: Date): boolean {
    return isEqual(target, start) || isEqual(target, end) || (isAfter(target, start) && isBefore(target, end));
  }

  public static isSameOrBefore(leftPart: Date, rightPart: Date): boolean {
    return isEqual(leftPart, rightPart) || isBefore(leftPart, rightPart);
  }

  public static isSameOrAfter(leftPart: Date, rightPart: Date): boolean {
    return isEqual(leftPart, rightPart) || isAfter(leftPart, rightPart);
  }

}

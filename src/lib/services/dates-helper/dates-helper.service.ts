import { Injectable } from '@angular/core';
import { Range, RelativeDate, RelativeRange, MonthYear } from '../../models/date-time.model';
import * as moment_ from 'moment';
import { DurationInputArg1, DurationInputArg2, MomentInput } from 'moment';
import { HelperService } from '../helper/helper.service';

const moment = moment_;

const STD_DATE_FORMAT = 'DD.MM.YYYY';
const TIMESHIFT_JOINED = /\+\d{4}$/;
const RELATIVE_DATE_SHIFT_PATTERN = '[\\+\\-](\\d+y)?(\\d+m)?(\\d+d)?';
const KNOWN_RELATIVE_DATE_BASES: { [name: string]: (key: string) => Date } = {
  today: (fragment: string) => {
    return moment().startOf('day').toDate();
  },
  'start of year': (fragment: string) => {
    return moment().startOf('year').startOf('day').toDate();
  },
  'start of month': (fragment: string) => {
    return moment().startOf('month').startOf('day').toDate();
  },
  'start of week': (fragment: string) => {
    return moment().startOf('week').startOf('day').toDate();
  },
  'end of year': (fragment: string) => {
    return moment().endOf('year').startOf('day').toDate();
  },
  'end of month': (fragment: string) => {
    return moment().endOf('month').startOf('day').toDate();
  },
  'end of week': (fragment: string) => {
    return moment().endOf('week').startOf('day').toDate();
  },
  '\\d\\d\\.\\d\\d\\.\\d\\d\\d\\d': (fragment: string) => {
    return moment(fragment, 'DD.MM.YYYY').startOf('day').toDate();
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

  public static relativeDateToDate(relativeDate: RelativeDate) {
    if (relativeDate === null || !relativeDate.text) {
      return moment().startOf('day').toDate();
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
    const result = moment(initialDate);
    const STARTED_FROM_SHIFT_PATTERN = new RegExp('^' + RELATIVE_DATE_SHIFT_PATTERN);
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
              result.add(value, 'year');
              break;
            }
            case 'M': {
              result.add(value, 'month');
              break;
            }
            case 'D': {
              result.add(value, 'day');
              break;
            }
          }
        }
      }
      shiftRest = shiftRest.substring(shiftPart.length);
    }
    return result.toDate();
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

  public static relativeRangeToRange(relativeRange: RelativeRange, asText: boolean = false) {
    const startDate = relativeRange.start instanceof Date ?
      relativeRange.start : DatesHelperService.relativeDateToDate(relativeRange.start);
    const endDate = relativeRange.end instanceof Date ?
      relativeRange.end : DatesHelperService.relativeDateToDate(relativeRange.end);
    const startDateText = moment(startDate).format(STD_DATE_FORMAT);
    const endDateText = moment(endDate).format(STD_DATE_FORMAT);
    return asText ? new Range<string>(startDateText, endDateText) : new Range<Date>(startDate, endDate);
  }

  public static isExpiredDate(date: MomentInput): boolean {
    return moment(date, 'DD.MM.YYYY').isBefore(moment(), 'days');
  }

  public static isExpiredDateAfter(date: MomentInput, amount: DurationInputArg1, units: DurationInputArg2): boolean {
    return DatesHelperService.isExpiredDate(moment(date, 'DD.MM.YYYY').subtract(amount, units));
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

}

import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MomentInput } from 'moment';
import { DatesHelperService } from '../services/dates-helper/dates-helper.service';
import { RelativeDate, RelativeRange } from '../models/date-time.model';
import * as moment_ from 'moment';

const moment = moment_;
const GENERAL_LETTERS = 'ABCEHKMOPXYTabcehkmopxytАВСЕНКМОРХУТавсенкморхут';
const CYRILLIC_LETTERS = 'а-яА-ЯёЁ';

// @dynamic
@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {
  }

  public readonly masks = {
    snils: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, ' ', /\d/, /\d/],
    inn: [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
    index: [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
    year:  [/\d/, /\d/, /\d/, /\d/],
    seriesNumberMilitaryMask: [/[а-я]/i, /[а-я]/i, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
    driverLicenseSeriesNumber: [/[0-9А-ЯЁа-яё]/, /[0-9А-ЯЁа-яё]/, /[0-9А-ЯЁа-яё]/, /[0-9А-ЯЁа-яё]/, ' ',
      /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
    vehicleRegCertificate: (value) => {
      if (value.length > 2 && isNaN(value[2])) {
        return [/\d/, /\d/, new RegExp(`[${GENERAL_LETTERS}]`),
          new RegExp(`[${GENERAL_LETTERS}]`), ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
      } else {
        return [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
      }
    },
    vehicleVin: [...Array(13).fill(/[\da-hj-npr-z]/i), ...Array(4).fill(/\d/)],
    price: [/\d/, '.', /\d/, /\d/]
  };

  public readonly regexp = {
    lastName: '(^[0-9А-ЯЁа-яё IVX()`.\'-]+$)|(^[0-9A-Za-z ()`.\'-]+$)',
    firstName: '((^[0-9А-ЯЁа-яё ()`.\'-]+[0-9А-ЯЁа-яё (),`.\'-]+[\,]?[0-9А-ЯЁа-яё ()`.\'-]+$)|(^[0-9А-ЯЁа-яё ()`.\'-]+$))|((^[0-9A-Za-z ()`.\'-]+[0-9A-Za-z (),`.\'-]+[\,]?[0-9A-Za-z ()`.\'-]+$)|(^[0-9A-Za-z ()`.\'-]+$))',
    middleName: '(^[0-9А-ЯЁа-яё ()`.\'-]+$)|(^[0-9A-Za-z ()`.\'-]+$)',
    birthCertificateSeriesFirst: '^[IVXLCivxlc]{1,6}',
    birthCertificateSeriesSecond: '^[а-яА-ЯёЁ]{2}',
    birthCertificateOldSeries: '[IVXLCivxlcа-яА-ЯёЁ−–—-]{1,9}$',
    birthCertificateNumber: '^[\\d]{6,7}$',
    birthCertificateFidNumber: '^[^<>&]{1,20}$',
    birthActNumber: '[0-9вВ−–—-]+',
    year: this.masks.year.join('').replace(/\//g, ''),
    driverLicenseSeriesNumber: this.masks.driverLicenseSeriesNumber.join('').replace(/\//g, ''),
    vehicleRegCertificate: `\\d\\d[0-9${GENERAL_LETTERS}][0-9${GENERAL_LETTERS}] \\d\\d\\d\\d\\d\\d`,
    vehicleName: '[0-9А-ЯЁа-яёA-Za-z \'‘’.,-]+',
    vehicleNumberPlateAuto: `^(([${GENERAL_LETTERS}]{2}((\\d{3}[${GENERAL_LETTERS}]\\d{2,3})|(\\d{5})))|([${GENERAL_LETTERS}]{1,2}\\d{6,7})|([${GENERAL_LETTERS}]\\d{8})|(\\d{3}[${GENERAL_LETTERS}]{1,2}\\d{2})|(\\d{3}[${GENERAL_LETTERS}]((\\d{3})|(\\d{5,6})))|(\\d{3}[${GENERAL_LETTERS}]{2}\\d{3,4})|([${GENERAL_LETTERS}]\\d{3}[${GENERAL_LETTERS}]{2}(\\d{2,3})?)|(\\d{9})|(\\d{3}(([${GENERAL_LETTERS}]\\d{5})|(\\d[${GENERAL_LETTERS}]{1,2}\\d{2})))|(\\d{4}${CYRILLIC_LETTERS}{2,3})|(${CYRILLIC_LETTERS}\\d{4}${CYRILLIC_LETTERS}{2})|(${CYRILLIC_LETTERS}{3}\\d{4,6})|([tTтТ][${GENERAL_LETTERS}]{2}\\d{5,6})|([kKкКcCсС][${GENERAL_LETTERS}]{2}\\d{5,6})|((D|d)\\d{7,8})|(\\d{3}(D|d)\\d{5,6})|(\\d{3}(c|C|с|С)(D|d)\\d{3,4}))$|(^$)`,
    vehicleNumberPlateBike: `^((\\d{4}[${GENERAL_LETTERS}]{1,2}\\d{2,3})|([${GENERAL_LETTERS}]{2}\\d{2}[${GENERAL_LETTERS}]{2}\\d{2,3}))$`,
    vehicleVin: '^[A-HJ-NPR-Za-hj-npr-z\\d]{13}[\\d]{4}$',
    escapeSpecial: '[^<>&]+',
    medicalInsuranceNumber: '^([0-9a-zA-Zа-яА-ЯёЁ\\-\.]+\\s?[0-9a-zA-Zа-яА-ЯёЁ\\-\.]*)$'
  };

  public static symbolsContains(str: string, symbolsArr: RegExp): any[] | null {
    return str.match(symbolsArr);
  }

  public static maxLengthWordValidator(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const arrWords = control.value ? control.value.replace(/[\r\n]+/g, ' ').split(' ') : [];
      return arrWords.some(word => word.length > length) ? {maxLengthWord: true} : null;
    };
  }

  public static oneOrTwoLatinSymbolsInDocSeries(control: AbstractControl) {
    return new RegExp('^[IVXLCivxlc]{1,2}').test(control.value) ? null : {wrongLatinSeries: true};
  }

  public static onlyDigits(control: AbstractControl) {
    return new RegExp('^\\d+$').test(control.value) ? null : {wrongLatinSeries: true};
  }

  public static twoCyrillicSymbolsInDocSeries(control: AbstractControl) {
    return new RegExp('^[А-ЯЁа-яё]{2}').test(control.value) ? null : {wrongCyrillicSeries: true};
  }
  public static latinSymbolsInDocSeries(minLength: number, maxLength: number) {
    return (control: AbstractControl) => {
      return new RegExp(`^[IVXLCivxlc]{${minLength},${maxLength}}\$`).test(control.value) ? null : {wrongLatinSeries: true};
    };
  }

  public static escapeSpecialSymbols(control: AbstractControl) {
    return new RegExp('[^<>&]+').test(control.value) ? null : {containsEscapeSymbols: true};
  }

  // TODO ADD-HOC!
  public static escapeSpecialSymbols2(control: AbstractControl) {
    return control.value && new RegExp('[<>&]+').test(control.value) ? {containsEscapeSymbols: true} : null;
  }

  // -> {invalid}
  public static validDateOptional(control: AbstractControl) {
    const value = control.value;
    return !value || (value instanceof Date && !isNaN(value.getTime())) ? null : {invalid: true};
  }

  // -> {invalid, required}
  public static validDate(control: AbstractControl) {
    return !control.value ? {required: true} : ValidationService.validDateOptional(control);
  }

  // -> {invalid, outside}
  public static insideRangeOptional(range: RelativeRange) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value) {
        return ValidationService.validDateOptional(control)
          || (DatesHelperService.isDateWithinRelativeRange(value, range) ? null : {outside: true});
      }
      return null;
    };
  }

  // -> {invalid, required, outside}
  public static insideRange(range: RelativeRange) {
    const insideRangeOptional = ValidationService.insideRangeOptional(range);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : insideRangeOptional(control);
    };
  }

  // -> {invalid, dateBefore, dateAfter}
  public static withinRangeOptional(range: RelativeRange) {
    const dateBefore = ValidationService.dateBeforeOptional(range.start, false);
    const dateAfter = ValidationService.dateAfterOptional(range.end, false);
    return (control: AbstractControl) => {
      const value = control.value;
      if (value) {
        return ValidationService.validDateOptional(control) || dateBefore(control) || dateAfter(control);
      }
      return null;
    };
  }

  // -> {invalid, required, dateBefore, dateAfter}
  public static withinRange(range: RelativeRange) {
    const withinRangeOptional = ValidationService.withinRangeOptional(range);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : withinRangeOptional(control);
    };
  }

  // -> {invalid, dateBefore}
  public static dateBeforeOptional(date: RelativeDate | Date, including = true) {
    return (control: AbstractControl) => {
      const value = control.value ? moment(control.value) : null;
      if (value) {
        const bound = date instanceof RelativeDate ? DatesHelperService.relativeDateToDate(date) : date as Date;
        const check = including ? value.isSameOrBefore : value.isBefore;
        return ValidationService.validDateOptional(control) || (check(bound, 'day') ? null : {dateBefore: true});
      }
      return null;
    };
  }

  // {invalid, required, dateBefore}
  public static dateBefore(date: RelativeDate | Date, including = true) {
    const dateBeforeOptional = ValidationService.dateBeforeOptional(date, including);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : dateBeforeOptional(control);
    };
  }

  // -> {invalid, dateAfter}
  public static dateAfterOptional(date: RelativeDate | Date, including = true) {
    return (control: AbstractControl) => {
      const value = control.value ? moment(control.value) : null;
      if (value) {
        const bound = date instanceof RelativeDate ? DatesHelperService.relativeDateToDate(date) : date as Date;
        const check = including ? value.isSameOrAfter : value.isAfter;
        return ValidationService.validDateOptional(control) || (check(bound, 'day') ? null : {dateAfter: true});
      }
      return null;
    };
  }

  // -> {invalid, required, dateAfter}
  public static dateAfter(date: RelativeDate | Date, including = true) {
    const dateAfterOptional = ValidationService.dateAfterOptional(date, including);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : dateAfterOptional(control);
    };
  }

  public static twoCyrillicSymbols(str: string): boolean {
    return new RegExp('^[А-ЯЁа-яё]{2}').test(str);
  }

  public static actNumberValidator(control: AbstractControl) {
    const regexp = '(?=^[^-?]*-?[^-?]*$)(?=^[^(в|В)?]*[(в|В)]?[^(в|В)?]*$)(?=^(?!-)([0-9\\-(в|В)]+)$)';
    if (!control.value) {
      return null;
    }
    if (new RegExp(regexp).test(control.value)) {
      const hyphenCount = control.value.split('').reduce((acc, curr) => acc += curr === '-' ? 1 : 0, 0);
      // проверка на количество дефисов, не может быть больше 1 и не может быть в конце
      if (hyphenCount > 1 && control.value.lastIndexOf('-') !== control.value.length - 1)  {
        return {wrongActNo: true};
      }
      return null;
    } else  {
      return {wrongActNo: true};
    }
  }

  public static hyphenValidator(control: AbstractControl) {
    const value = (control.value ? control.value : '').toString();

    return value.charAt(0).replace(/[^−–—-]/g, '').length === 1 ||
     value.slice(-1).replace(/[^−–—-]/g, '').length === 1 ? {patternHyphen: true} : null;
  }

  public static checkWordLengthExceed(str, maxLen): boolean {
    if (!str) {
      return false;
    }
    const wordsArr = str.split(' ');
    return wordsArr.every((word) => {
      return word.length <= maxLen;
    });
  }

  public static militaryIdNumberValidator(control: AbstractControl) {
    const value = control.value ? control.value : '';
    const seriesNumberArr = value.split(' ');
    if (!seriesNumberArr[1]) {
      return {emptyNumber: true};
    }
    if (seriesNumberArr[1] && seriesNumberArr[1].length < 6) {
      return {errorNumber: true};
    }
    return null;
  }

  public static checkDateIsTodayOrAfter(date: string): boolean {
    return moment(date, 'DD.MM.YYYY').isBefore(moment(), 'days');
  }

  public static sameValueValidator(previousValue: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (previousValue && control.value) {
        return previousValue.replace(/\D/g, '') === control.value.replace(/\D/g, '') ? { sameValue: true } : null;
      } else {
        return null;
      }
    };
  }

}

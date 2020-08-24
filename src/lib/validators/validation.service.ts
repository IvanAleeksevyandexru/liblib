import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MomentInput } from 'moment';
import { DatesHelperService } from '../services/dates-helper/dates-helper.service';
import { RelativeDate, RelativeRange } from '../models/date-time.model';
import { HelperService } from '../services/helper/helper.service';
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

  public static map(map: { [key: string]: string}, validator: (control: AbstractControl) => any) {
    return (control: AbstractControl) => {
      const original = validator(control);
      if (HelperService.isObject(original)) {
        const result = {};
        for (const error of Object.keys(original)) {
          result[map[error] ? map[error] : error] = original[error];
        }
        return result;
      }
      return original;
    };
  }

  // -> {invalid}. валидность даты
  public static validDateOptional(control: AbstractControl) {
    const value = control.value;
    return !value || (value instanceof Date && !isNaN(value.getTime())) ? null : {invalid: true};
  }

  // -> {invalid, required}. валидность и наличие
  public static validDateRequired(control: AbstractControl) {
    return !control.value ? {required: true} : ValidationService.validDateOptional(control);
  }

  // -> {invalid, outside}. валидность и вхождение в рейндж
  public static insideRange(range: RelativeRange) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value) {
        return ValidationService.validDateOptional(control)
          || (DatesHelperService.isDateWithinRelativeRange(value, range) ? null : {outside: true});
      }
      return null;
    };
  }

  // -> {invalid, required, outside}. валидность, наличие, вхождение в рейндж
  public static insideRangeRequired(range: RelativeRange) {
    const insideRangeOptional = ValidationService.insideRange(range);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : insideRangeOptional(control);
    };
  }

  // -> {invalid, dateBefore, dateAfter}. валидность и вхождение в рейндж
  public static withinRange(range: RelativeRange) {
    const dateAfter = ValidationService.dateAfter(range.start);
    const dateBefore = ValidationService.dateBefore(range.end);
    return (control: AbstractControl) => {
      const value = control.value;
      if (value) {
        return ValidationService.validDateOptional(control) || dateBefore(control) || dateAfter(control);
      }
      return null;
    };
  }

  // -> {invalid, required, dateBefore, dateAfter}. валидность, наличие, вхождение в рейндж
  public static withinRangeRequired(range: RelativeRange) {
    const withinRangeOptional = ValidationService.withinRange(range);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : withinRangeOptional(control);
    };
  }

  // -> {invalid, dateBefore}. валидность, максимум
  public static dateBefore(date: RelativeDate | Date, including = true) {
    return (control: AbstractControl) => {
      const value = control.value ? moment(control.value) : null;
      if (value) {
        const bound = date instanceof RelativeDate ? DatesHelperService.relativeDateToDate(date) : date as Date;
        const check = including ? value.isSameOrBefore : value.isBefore;
        return ValidationService.validDateOptional(control) || (check.call(value, bound, 'day') ? null : {dateBefore: true});
      }
      return null;
    };
  }

  // {invalid, required, dateBefore}. валидность, наличие, максимум
  public static dateBeforeRequired(date: RelativeDate | Date, including = true) {
    const dateBeforeOptional = ValidationService.dateBefore(date, including);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : dateBeforeOptional(control);
    };
  }

  // -> {invalid, dateAfter}. валидность, минимум
  public static dateAfter(date: RelativeDate | Date, including = true) {
    return (control: AbstractControl) => {
      const value = control.value ? moment(control.value) : null;
      if (value) {
        const bound = date instanceof RelativeDate ? DatesHelperService.relativeDateToDate(date) : date as Date;
        const check = including ? value.isSameOrAfter : value.isAfter;
        return ValidationService.validDateOptional(control) || (check.call(value, bound, 'day') ? null : {dateAfter: true});
      }
      return null;
    };
  }

  // -> {invalid, required, dateAfter}. валидность, наличие, минимум
  public static dateAfterRequired(date: RelativeDate | Date, including = true) {
    const dateAfterOptional = ValidationService.dateAfter(date, including);
    return (control: AbstractControl) => {
      return !control.value ? {required: true} : dateAfterOptional(control);
    };
  }

  // -> {invalid, outside}: dynamic. валидность, вхождение в рейндж (определяется динамически)
  public static insideRangeDynamic(dynamicRangeEvaluator: () => RelativeRange) {
    return (control: AbstractControl) => {
      const range = dynamicRangeEvaluator();
      return range ? ValidationService.insideRange(range)(control) : null;
    };
  }

  // -> {invalid, dateBefore, dateAfter}: dynamic. валидность, вхождение в рейндж (определяется динамически)
  public static withinRangeDynamic(dynamicRangeEvaluator: () => RelativeRange) {
    return (control: AbstractControl) => {
      const range = dynamicRangeEvaluator();
      return range ? ValidationService.withinRange(range)(control) : null;
    };
  }

  // -> {invalid, dateBefore}: dynamic. валидность, максимум (определяется динамически)
  public static dateBeforeDynamic(dynamicDateEvaluator: () => Date | RelativeDate) {
    return (control: AbstractControl) => {
      const date = dynamicDateEvaluator();
      return date ? ValidationService.dateBefore(date)(control) : null;
    };
  }

  // -> {invalid, dateAfter}: dynamic, валидность, минимум (определяется динамически)
  public static dateAfterDynamic(dynamicDateEvaluator: () => Date | RelativeDate) {
    return (control: AbstractControl) => {
      const date = dynamicDateEvaluator();
      return date ? ValidationService.dateAfter(date)(control) : null;
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

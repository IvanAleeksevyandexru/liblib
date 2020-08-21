import { Injectable } from '@angular/core';
import { HelperService } from '../helper/helper.service';
import { ValidationErrors } from '@angular/forms';
import { ValidationDetailed, Validated, ValidationShowStrategy, ValidationShowContext } from '../../models/validation-show';

@Injectable({
  providedIn: 'root'
})
export class ValidationHelper {

  public static isValidationOk(value: boolean | string | ValidationErrors): boolean {
    return [null, '' as any, true as any, undefined].includes(value) || (HelperService.isObject(value) && !Object.keys(value));
  }

  public static isValidationBroken(value: boolean | string | ValidationErrors): boolean {
    return !ValidationHelper.isValidationOk(value);
  }

  public static isComponentValidationBroken(component: Validated | ValidationDetailed): boolean {
    if ((component as ValidationDetailed).validation !== undefined) {
      return ValidationHelper.isValidationBroken((component as ValidationDetailed).validation);
    } else {
      return component.invalid;
    }
  }

  public static isComponentValidationOk(component: Validated | ValidationDetailed): boolean {
    return !ValidationHelper.isComponentValidationBroken(component);
  }

  public static createStdValidationShowContext(component: any, override?: { [key: string]: boolean }): ValidationShowContext {
    override = override || {};
    return {
      focused: override.focused === undefined ? component.focused : override.focused,
      touched: override.touched === undefined ? component.touched : override.touched,
      empty: override.empty === undefined ? component.empty : override.empty,
      disabled: override.disabled === undefined ? component.disabled : override.disabled,
      additional: override.additional === undefined ? {} : override.additional
    } as ValidationShowContext;
  }

  // метод объединяет "знание" о неправильности значения с параметром когда ошибку показывать и возвращает должно ли быть invalidDisplayed
  public static checkValidation(component: Validated | ValidationDetailed, override?: { [key: string]: boolean }) {
    const isFieldInvalid = ValidationHelper.isComponentValidationBroken(component);
    if (component.validationShowOn === undefined) {
      return isFieldInvalid;
    } else if (HelperService.isString(component.validationShowOn) || HelperService.isFunction(component.validationShowOn)) {
      const validationShowContext = ValidationHelper.createStdValidationShowContext(component, override);
      if (HelperService.isString(component.validationShowOn)) {
        // validationShowOn - имя стратегии которая управляет показом валидации, ищем стратегию по name
        let validationShowStrategy = ValidationShowStrategy.byName(component.validationShowOn);
        if (component.validationShowOn && !validationShowStrategy) {
          console.warn('validation show strategy \'' + component.validationShowOn + '\' not recognized, please check');
          validationShowStrategy = ValidationShowStrategy.immediate;
        }
        return isFieldInvalid && validationShowStrategy(validationShowContext);
      } else {
        // validationShowOn функция
        return isFieldInvalid && (component.validationShowOn as ((ValidationShowContext) => boolean))(validationShowContext);
      }
    } else {
      // validationShowOn - не имя, а просто значение (например boolean) управляющее показом напрямую
      const validationShouldShow = !!component.validationShowOn;
      return isFieldInvalid && validationShouldShow;
    }
  }
}

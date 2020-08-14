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

  public static checkValidation(component: Validated | ValidationDetailed, override?: { [key: string]: boolean }) {
    const isFieldInvalid = ValidationHelper.isComponentValidationBroken(component);
    const validationShowStrategyName = component.validationShowOn;
    const validationShowStrategy = ValidationShowStrategy.byName(validationShowStrategyName) || ValidationShowStrategy.immediate;
    const validationShowContext = ValidationHelper.createStdValidationShowContext(component, override);
    return isFieldInvalid && validationShowStrategy(validationShowContext);
  }
}

import { PipedMessage } from './piped-message';
import { ValidationErrors } from '@angular/forms';
import { HelperService } from '../services/helper/helper.service';
import { Translation, ValidationShowOn } from './common-enums';

const CONST_PATTERN = /^[A-Z_]+$/;
const SIMPLE_PATTERN = /^[a-z_]+$/;

export { ValidationShowOn } from './common-enums'; // ре-экспорт, чисто для удобства

export class ValidationMessages {

  constructor(messages: string | PipedMessage | { [key: string]: string | PipedMessage },
              translation = Translation.NONE, escapeHtml = true) {
    this.messages = messages;
    this.translation = translation;
    this.escapeHtml = escapeHtml;
  }

  public messages: string | PipedMessage | { [key: string]: string | PipedMessage };
  public escapeHtml = true;
  public translation = Translation.NONE;
}


export class ValidationShowContext {
  public focused = false;
  public touched = false;
  public empty = false;
  public disabled = false;
  public additional = {};
}

export interface Validated {

  invalid: boolean;
  validationShowOn: ValidationShowOn | string;

}

export interface ValidationDetailed extends Validated {

  validation: boolean | string | ValidationErrors;
  validationMessages: string | PipedMessage | ValidationMessages;

}


export class ValidationShowStrategy {

  public static byName(constantName: string): (ValidationShowContext) => boolean {
    const localName = CONST_PATTERN.test(constantName) || SIMPLE_PATTERN.test(constantName) ?
      HelperService.toCamelCase(constantName) : constantName;
    return ValidationShowStrategy[localName];
  }

  public static immediate(context: ValidationShowContext) {
    return true;
  }

  public static never(context: ValidationShowContext) {
    return false;
  }

  public static touched(context: ValidationShowContext) {
    return context.touched;
  }

  public static touchedUnfocused(context: ValidationShowContext) {
    return context.touched && !context.focused;
  }

}

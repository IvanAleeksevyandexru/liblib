import { PipedMessage } from './piped-message';
import { ValidationErrors } from '@angular/forms';
import { HelperService } from '../services/helper/helper.service';
import { Translation, ValidationShowOn } from './common-enums';

const CONST_PATTERN = /^[A-Z_]+$/;
const SIMPLE_PATTERN = /^[a-z_/-]+$/;

export { ValidationShowOn } from './common-enums'; // ре-экспорт, чисто для удобства

// класс отвечает за передачу множества сообщений валидации на все случаи жизни плюс их базовую параметризацию с возможностью
// mixin-ить к базовой параметризации дополнительно значение/параметры самой валидации (для доступности всего этого при выводе на экран)
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

// дополнительные данные контролов, передаваемые функции которая решает показывать ли валидацию
export class ValidationShowContext {
  public focused = false;
  public touched = false;
  public empty = false;
  public disabled = false;
  public additional = {};
}

// валидность поля + когда показывать невалидность, контрол не может показывать текст ошибки, невалидность дискретна (да или нет)
export interface Validated {

  // валидность поля, undefined - валидно
  invalid: boolean;
  // когда показывать валидацию, строка интерпретируется как имя стратегии в ValidationShowStrategy,
  // что угодно другое интерпретируется как bool (кроме undefined, undefined интерпретируется как показ invalid без проверок),
  // возможна передача функции которая будет работать аналогично стратегии (это для совсем кастомных случаев, подразумевается
  // что большинство новых ситуаций могут быть описаны добавлением новых членов в ValidationShowStrategy и будут переиспользуемы)
  validationShowOn: string | ValidationShowOn | ((ValidationShowContext) => boolean) | boolean | any;

}

// коды ошибок + сообщения для них, контрол может показывать развернутый текст(а) ошибки, соответствующий(ие) ошибке(ам)
export interface ValidationDetailed extends Validated {

  // расширенная валидация с кодами ошибок и возможно параметрами форматирования вида
  // x не может быть больше n - x вернется тут, только валидатор "знает" какое значение он проверял
  validation: boolean | string | ValidationErrors;
  // пак сообщений для различных кодов ошибок со своей базовой параметризацией
  // x не может быть больше n - n будет храниться тут потому что мы заранее знаем этот параметр
  validationMessages: string | PipedMessage | ValidationMessages;

}

// стандартные варианты определения когда показывать валидацию (колелкция стратегий подразумевается расширяемой новыми сценариями)
export class ValidationShowStrategy {

  // найти стратегию если validationShowOn задано строкой из данного множества стандартных вариантов
  public static byName(constantName: string): (ValidationShowContext) => boolean {
    const localName = CONST_PATTERN.test(constantName) || SIMPLE_PATTERN.test(constantName) ?
      HelperService.toCamelCase(constantName) : constantName;
    return ValidationShowStrategy[localName];
  }

  // показывать невалидность тут же, не глядя ни на какие другие факторы
  public static immediate(context: ValidationShowContext) {
    return true;
  }

  // не показывать невалидность на экране, просто знать что поле не валидно
  public static never(context: ValidationShowContext) {
    return false;
  }

  // показывать невалидность только когда с полем уже взаимодействовали
  public static touched(context: ValidationShowContext) {
    return context.touched;
  }

  // показывать невалидность если с полем взаимодействовали и не взаимодействуют прямо сейчас
  public static touchedUnfocused(context: ValidationShowContext) {
    return context.touched && !context.focused;
  }

}

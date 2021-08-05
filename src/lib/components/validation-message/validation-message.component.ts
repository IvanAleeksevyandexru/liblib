import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ValidationMessages } from 'epgu-lib/lib/models';
import { PipedMessage } from 'epgu-lib/lib/models';
import { Translation } from 'epgu-lib/lib/models';
import { ValidationHelper } from 'epgu-lib/lib/services/validation-helper';
import { HelperService } from 'epgu-lib/lib/services/helper';

class Message {
  constructor(str: string | PipedMessage | any, key: string, isDefault = false) {
    if (str instanceof PipedMessage) {
      this.key = key;
      this.piped = str;
    } else {
      this.str = str;
      this.isDefault = isDefault;
    }
  }
  public key: string;
  public str: string;
  public piped: PipedMessage;
  public isDefault = false;
}

@Component({
  selector: 'lib-validation-message',
  templateUrl: 'validation-message.component.html',
  styleUrls: ['./validation-message.component.scss']
})
export class ValidationMessageComponent implements OnInit, OnChanges {

  // результат проверки поля в простом виде true/false, если validation определена, то не принимается во внимание
  @Input() public invalid = false;
  // результат валидации поля в развернутом виде, в одном из допустимых форматов (undefined = корректность определяется по invalid):
  // boolean: true корректно, false не корректно
  // string - код ошибки или null = ок
  // ValidationErrors | Object | null - мапа кодов ошибок, null или отсутствие ключей = ок
  // Array<string> - массив кодов ошибок, [] = ок
  @Input() public validation: ValidationErrors | any;
  // текст/текста ошибки либо единичное сообщение ошибки для всех ситуаций в одном из форматов:
  // string | Piped - одиночное сообщение валидации для всех кейсов
  // ValidationMessages<string, string | Piped> | Object<string, string | Piped> - мапа с соответствием
  //                       (сопоставлением) какому коду ошибки должен соответствовать какой текст
  @Input() public validationMessages?: string | PipedMessage | { [key: string]: string | PipedMessage } | ValidationMessages;

  @Input() public translation: Translation | string = Translation.APP;
  @Input() public escapeHtml = true;

  public messages: Array<Message> = [];
  public Translation = Translation;

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public update() {
    const invalidDisplayed = this.invalid || ValidationHelper.isValidationBroken(this.validation);
    if (invalidDisplayed && this.validationMessages) {
      let violatedErrorCodes = [];
      let defaultErrorCodeViolated = false;
      if (this.validation === undefined && this.invalid) {
        defaultErrorCodeViolated = true;
      } else {
        if (this.validation === false || this.validation === null) {
          defaultErrorCodeViolated = true;
        } else if (HelperService.isString(this.validation)) {
          violatedErrorCodes = [this.validation];
        } else if (HelperService.isObject(this.validation)) {
          violatedErrorCodes = Object.keys(this.validation);
        } else if (HelperService.isArray(this.validation)) {
          violatedErrorCodes = this.validation;
        }
      }
      let anyCodesFound = false;
      this.messages = [];
      for (const violatedErrorCode of violatedErrorCodes) {
        if (HelperService.isString(this.validationMessages)) {
          // не сопоставляем, будет применено в дефолте
        } else if (this.validationMessages instanceof PipedMessage) {
          // аналогично
        } else if (this.validationMessages instanceof ValidationMessages) {
          const validationMessages = this.validationMessages as ValidationMessages;
          if (validationMessages.messages[violatedErrorCode]) {
            anyCodesFound = true;
            this.messages.push(new Message(validationMessages.messages[violatedErrorCode], violatedErrorCode, false));
          }
        } else if (HelperService.isObject(this.validationMessages)) {
          if ((this.validationMessages as any)[violatedErrorCode]) {
            anyCodesFound = true;
            this.messages.push(new Message(this.validationMessages[violatedErrorCode], violatedErrorCode, false));
          }
        }
      }
      if (violatedErrorCodes.length && !anyCodesFound) {
        defaultErrorCodeViolated = true;
      }
      if (defaultErrorCodeViolated) {
        if (HelperService.isString(this.validationMessages)) {
          this.messages.push(new Message(this.validationMessages, null, false));
        } else if (this.validationMessages instanceof PipedMessage) {
          this.messages.push(new Message(this.validationMessages, null, false));
        } else {
          this.messages.push(new Message(null, null, true));
        }
      }
      if (this.validationMessages instanceof ValidationMessages) {
        this.translation = this.validationMessages.translation;
        this.escapeHtml = this.validationMessages.escapeHtml;
      }
    } else {
      this.messages = [];
    }
  }

}

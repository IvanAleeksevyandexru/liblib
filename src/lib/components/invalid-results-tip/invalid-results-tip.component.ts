import { Component, OnInit, OnChanges, SimpleChanges,
  Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ValidationMessages } from '../../models/validation-show';
import { PipedMessage } from '../../models/piped-message';
import { Translation, TipDirection } from '../../models/common-enums';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { HelperService } from '../../services/helper/helper.service';
import { ConstantsService } from '../../services/constants.service';
import { PositioningManager, PositioningRequest } from '../../services/positioning/positioning.manager';

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

const OVERLAP_POSITIONING = ConstantsService.BUBBLE_OVERLAP_POSITIONING;

@Component({
  selector: 'lib-invalid-results-tip',
  templateUrl: 'invalid-results-tip.component.html',
  styleUrls: ['./invalid-results-tip.component.scss']
})
export class InvalidResultsTipComponent implements OnInit, OnChanges {

  constructor(private changeDetector: ChangeDetectorRef,
              private positioningManager: PositioningManager) {}

  @Input() public invalid = false;
  // результат валидации поля:
  // true/false - false - ошибка
  // string - код ошибки или null = ок
  // ValidationErrors - мапа кодов ошибок, значения могут быть любые
  @Input() public validation: boolean | string | ValidationErrors = null;
  // текст/текста ошибки
  // либо единичное сообщение ошибки
  // либо мапа с сопоставлением кода ошибок текстам ошибок (где любой элемент может быть Piped, т.е. нести свое форматирование с собой)
  @Input() public validationMessages?: string | PipedMessage | { [key: string]: string | PipedMessage } | ValidationMessages;

  @Input() public translation: Translation | string = Translation.NONE;
  @Input() public escapeHtml = true;

  @Input() public tipDirection: TipDirection | string = TipDirection.LEFT;
  @Input() public showOnHover = true;
  @Input() public containerOverlap = false;

  @Output() public show = new EventEmitter();
  @Output() public hide = new EventEmitter();

  @ViewChild('errorIcon') private errorIcon: ElementRef;
  @ViewChild('errorTipContainer', {static: false}) public errorTipContainer: ElementRef;

  public forceShow = undefined;
  public hovered = false;
  public invalidDisplayed = false;
  public messages: Array<Message> = [];
  public positioningDescriptor: PositioningRequest = null;
  public Translation = Translation;
  public TipDirection = TipDirection;

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public toggle() {
    if (this.forceShow) {
      this.hideDialog();
    } else {
      this.showDialog();
    }
  }

  public showDialog() {
    const visible = this.isDialogVisible();
    if (!visible) {
      this.show.emit();
    }
    this.forceShow = true;
    this.checkContainerOverlap(visible);
  }

  public hideDialog() {
    const visible = this.isDialogVisible();
    if (visible) {
      this.hide.emit();
    }
    this.forceShow = false;
    this.checkContainerOverlap(visible);
  }

  public markHovered() {
    const visible = this.isDialogVisible();
    if (this.showOnHover) {
      this.hovered = true;
      if (this.forceShow === undefined) {
        this.show.emit();
      }
    }
    this.checkContainerOverlap(visible);
  }

  public markUnhovered() {
    const visible = this.isDialogVisible();
    if (this.showOnHover) {
      this.hovered = false;
      if (this.forceShow === undefined) {
        this.hide.emit();
      }
    }
    this.checkContainerOverlap(visible);
  }

  public checkContainerOverlap(initialVisibility: boolean) {
    if (!this.containerOverlap) {
      return;
    }
    const currentVisibility = this.isDialogVisible();
    if (currentVisibility && !initialVisibility) {
      this.changeDetector.detectChanges();
      this.positioningDescriptor = Object.assign(
        {master: this.errorIcon, slave: this.errorTipContainer, destroyOnScroll: false},
        OVERLAP_POSITIONING[(this.tipDirection || TipDirection.RIGHT).toUpperCase().replace(/\-/g, '_')]) as PositioningRequest;
      this.positioningManager.attach(this.positioningDescriptor);
    } else if (!currentVisibility && initialVisibility && this.positioningDescriptor) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
  }

  public update() {
    this.invalidDisplayed = (this.invalid || ValidationHelper.isValidationBroken(this.validation)) && !!this.validationMessages;
    if (this.invalidDisplayed && this.validationMessages) {
      let isSingleMessage = HelperService.isString(this.validationMessages) || this.validationMessages instanceof PipedMessage;
      let validationMessages = {};
      let simpleValue = this.validationMessages;
      if (!isSingleMessage) {
        if (this.validationMessages instanceof ValidationMessages) {
          const validationMessagesTyped = this.validationMessages as ValidationMessages;
          isSingleMessage = isSingleMessage ||
              HelperService.isString(validationMessagesTyped.messages) || validationMessagesTyped.messages instanceof PipedMessage;
          this.escapeHtml = validationMessagesTyped.escapeHtml;
          this.translation = validationMessagesTyped.translation;
          validationMessages = isSingleMessage ? {} : validationMessagesTyped.messages;
          simpleValue = isSingleMessage ? validationMessagesTyped.messages : null;
        } else {
          validationMessages = this.validationMessages;
          simpleValue = null;
        }
      }
      const noMessages = isSingleMessage ? true : !Object.keys(validationMessages).length;
      const DEFAULT_ERROR = {};
      if (this.validation === false || (!this.validation && this.invalid) || isSingleMessage || noMessages) {
        const key = isSingleMessage || noMessages ? null : Object.keys(validationMessages)[0];
        const msg = key ? validationMessages[key] : (simpleValue || DEFAULT_ERROR);
        this.messages = [new Message(msg, key, msg === DEFAULT_ERROR)];
      } else if (HelperService.isString(this.validation)) {
        const msg = validationMessages[this.validation as string] || DEFAULT_ERROR;
        this.messages = [new Message(msg, this.validation as string, msg === DEFAULT_ERROR)];
      } else {
        const keys = HelperService.keys(this.validation).filter((key) => validationMessages[key]);
        if (keys.length) {
          this.messages = keys.map((key) => new Message(validationMessages[key], key));
        } else {
          this.messages = [new Message(null, null, true)];
        }
      }
    } else {
      this.messages = [];
    }
  }

  private isDialogVisible() {
    return this.forceShow === true || this.showOnHover && this.hovered && this.forceShow !== false;
  }
}

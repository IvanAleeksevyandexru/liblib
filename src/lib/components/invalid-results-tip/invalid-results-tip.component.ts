import { Component, OnInit, AfterViewInit, OnChanges, SimpleChanges,
  Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BubbleBase } from '../question-help-tip/bubble-base.component';
import { ValidationErrors } from '@angular/forms';
import { ValidationMessages } from '../../models/validation-show';
import { PipedMessage } from '../../models/piped-message';
import { Translation, TipDirection } from '../../models/common-enums';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { PositioningManager } from '../../services/positioning/positioning.manager';

@Component({
  selector: 'lib-invalid-results-tip',
  templateUrl: 'invalid-results-tip.component.html',
  styleUrls: ['./invalid-results-tip.component.scss']
})
export class InvalidResultsTipComponent extends BubbleBase implements OnInit, AfterViewInit, OnChanges {

  constructor(protected changeDetector: ChangeDetectorRef,
              protected positioningManager: PositioningManager) {
    super(changeDetector, positioningManager);
  }

  @Input() public invalid = false;
  // результат валидации поля:
  // true/false - false - ошибка
  // string - код ошибки или null = ок
  // ValidationErrors - мапа кодов ошибок, значения могут быть любые
  @Input() public validation: boolean | string | ValidationErrors;
  // текст/текста ошибки
  // либо единичное сообщение ошибки
  // либо мапа с сопоставлением кода ошибок текстам ошибок (где любой элемент может быть Piped, т.е. нести свое форматирование с собой)
  @Input() public validationMessages?: string | PipedMessage | { [key: string]: string | PipedMessage } | ValidationMessages;

  @Input() public translation: Translation | string = Translation.NONE;
  @Input() public escapeHtml = true;

  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;
  @Input() public showOnHover = true;
  @Input() public containerOverlap = false;

  @Output() public show = new EventEmitter();
  @Output() public hide = new EventEmitter();

  @ViewChild('errorIcon') public errorIcon: ElementRef;
  @ViewChild('errorTipContainer', {static: false}) public errorTipContainer: ElementRef;

  public invalidDisplayed = false;

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    this.icon = this.errorIcon;
    this.dialog = this.errorTipContainer;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public update() {
    this.invalidDisplayed = (this.invalid || ValidationHelper.isValidationBroken(this.validation)) && !!this.validationMessages;
  }

}

import {
  Component, AfterViewInit, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, Input, Output,
  EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BubbleBase } from './bubble-base.component';
import { Translation, TipDirection } from '../../models/common-enums';
import { PipedMessage } from '../../models/piped-message';
import { PositioningManager } from '../../services/positioning/positioning.manager';

@Component({
  selector: 'lib-question-help-tip',
  templateUrl: 'question-help-tip.component.html',
  styleUrls: ['./question-help-tip.component.scss']
})
export class QuestionHelpTipComponent extends BubbleBase implements OnInit, OnChanges, AfterViewInit {

  constructor(protected changeDetector: ChangeDetectorRef,
              protected positioningManager: PositioningManager) {
    super(changeDetector, positioningManager);
  }

  @Input() public questionTip?: string | PipedMessage;
  @Input() public escapeHtml = false;
  @Input() public translation: Translation | string = Translation.APP;
  @Input() public tipDirection: TipDirection | string = TipDirection.RIGHT;
  @Input() public showOnHover = true;
  @Input() public containerOverlap = false;
  @Input() public showCloseIcon = true;

  @Output() public show = new EventEmitter();
  @Output() public hide = new EventEmitter();

  @ViewChild('questionIcon') private questionIcon: ElementRef;
  @ViewChild('questionContainer', {static: false}) public questionContainer: ElementRef;

  public questionString: string;
  public questionPiped: PipedMessage;

  public ngOnInit() {
    this.update();
  }

  public ngAfterViewInit() {
    this.icon = this.questionIcon;
    this.dialog = this.questionContainer;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public update() {
    this.questionString = this.questionTip instanceof PipedMessage ? null : this.questionTip;
    this.questionPiped = this.questionTip instanceof PipedMessage ? this.questionTip : null;
  }

}

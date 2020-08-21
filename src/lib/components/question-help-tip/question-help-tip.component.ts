import {
  Component, AfterViewInit, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, Input, Output,
  EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Translation, TipDirection } from '../../models/common-enums';
import { PipedMessage } from '../../models/piped-message';
import { PositioningRequest, HorizontalAlign, VerticalAlign } from '../../models/positioning';
import { PositioningManager } from '../../services/positioning/positioning.manager';
import { ConstantsService } from '../../services/constants.service';
import { HelperService } from '../../services/helper/helper.service';

const OVERLAP_POSITIONING = ConstantsService.BUBBLE_OVERLAP_POSITIONING;

@Component({
  selector: 'lib-question-help-tip',
  templateUrl: 'question-help-tip.component.html',
  styleUrls: ['./question-help-tip.component.scss']
})
export class QuestionHelpTipComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  constructor(private changeDetector: ChangeDetectorRef,
              private positioningManager: PositioningManager) {}

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
  @ViewChild('closeIcon', {static: false}) private closeIcon: ElementRef;

  public forceShow = undefined;
  public hovered = false;
  public positioningDescriptor: PositioningRequest = null;
  public Translation = Translation;

  public questionString: string;
  public questionPiped: PipedMessage;

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public ngAfterViewInit() {
    if (!HelperService.isTouchDevice() && this.questionIcon) {
      this.questionIcon.nativeElement.addEventListener('mouseenter', this.markHovered.bind(this));
      this.questionIcon.nativeElement.addEventListener('mouseleave', this.markUnhovered.bind(this));
    }
  }

  public toggle(e: Event) {
    if (this.forceShow) {
      if (e.target === this.questionIcon.nativeElement || this.closeIcon && e.target === this.closeIcon.nativeElement) {
        this.hideDialog();
      }
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
      this.forceShow = false;
    }
    this.hide.emit();
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
      } else if (this.forceShow === false) {
        this.forceShow = undefined;
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
        {master: this.questionIcon, slave: this.questionContainer, destroyOnScroll: false},
        OVERLAP_POSITIONING[(this.tipDirection || TipDirection.RIGHT).toUpperCase().replace(/\-/g, '_')]) as PositioningRequest;
      this.positioningManager.attach(this.positioningDescriptor);
    } else if (!currentVisibility && initialVisibility && this.positioningDescriptor) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
  }

  public update() {
    this.questionString = this.questionTip instanceof PipedMessage ? null : this.questionTip;
    this.questionPiped = this.questionTip instanceof PipedMessage ? this.questionTip : null;
  }

  private isDialogVisible() {
    return this.forceShow === true || this.showOnHover && this.hovered && this.forceShow !== false;
  }

  public ngOnDestroy() {
    this.questionIcon.nativeElement.removeEventListener('mouseenter', this.markHovered);
    this.questionIcon.nativeElement.removeEventListener('mouseleave', this.markUnhovered);
  }
}

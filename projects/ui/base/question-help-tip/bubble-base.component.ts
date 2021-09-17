import { ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PositioningRequest } from '@epgu/ui/models';
import { Translation, TipDirection } from '@epgu/ui/models/common-enums';
import { PositioningManager } from '@epgu/ui/services/positioning';
import { ConstantsService } from '@epgu/ui/services/constants';

const OVERLAP_POSITIONING = ConstantsService.BUBBLE_OVERLAP_POSITIONING;

export class BubbleBase {

  constructor(protected changeDetector: ChangeDetectorRef,
              protected positioningManager: PositioningManager) {}

  // переопределится в дочерних
  public showOnHover = true;
  public containerOverlap = false;
  public tipDirection: TipDirection | string = TipDirection.RIGHT;

  public show = new EventEmitter();
  public hide = new EventEmitter();

  public icon: ElementRef;
  public dialog: ElementRef;

  public forceShow = undefined;
  public hovered = false;
  public positioningDescriptor: PositioningRequest = null;
  public Translation = Translation;

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
        {master: this.icon, slave: this.dialog, destroyOnScroll: false},
        OVERLAP_POSITIONING[(this.tipDirection || TipDirection.RIGHT).toUpperCase().replace(/\-/g, '_')]) as PositioningRequest;
      this.positioningManager.attach(this.positioningDescriptor);
    } else if (!currentVisibility && initialVisibility && this.positioningDescriptor) {
      this.positioningManager.detach(this.positioningDescriptor);
      this.positioningDescriptor = null;
    }
  }

  private isDialogVisible() {
    return this.forceShow === true || this.showOnHover && this.hovered && this.forceShow !== false;
  }
}

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { AnimationBuilder, style, animate } from '@angular/animations';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DragDropBinding, DragDropType, DragDropDirection, DragDropOffsetType, DragState } from '../../models/drag-drop.model';
import { HelperService } from '../helper/helper.service';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class DragDropManager {

  constructor(private rendererFactory: RendererFactory2, private animationBuilder: AnimationBuilder) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private renderer: Renderer2;
  private mouseSubscriptions: Map<DragDropBinding, Subscription> = new Map();
  private touchSubscriptions: Map<DragDropBinding, Subscription> = new Map();
  private subscriptionsActivity: Map<DragDropBinding, Subject<boolean>> = new Map();

  // применение функциональности драг-дропа к ленте
  public attach(request: DragDropBinding): void {
    if (!request || !request.feedElement) {
      return;
    }
    const feed = request.feedElement.nativeElement;
    const listenerActivity = new Subject<boolean>();
    let mouseListener = null;
    let touchListener = null;
    if (request.type === DragDropType.MOUSE || request.type === DragDropType.BOTH) {
      mouseListener = fromEvent(feed.parentElement, 'mousedown')
      .pipe(takeUntil(listenerActivity.asObservable()))
      .subscribe((e: MouseEvent) => {
        this.dragStart(request, e, null);
      });
    }
    if (request.type === DragDropType.TOUCH || request.type === DragDropType.BOTH) {
      touchListener = fromEvent(feed.parentElement, 'touchstart')
      .pipe(takeUntil(listenerActivity.asObservable()))
      .subscribe((e: TouchEvent) => {
        this.dragStart(request, null, e);
      });
    }
    this.mouseSubscriptions.set(request, mouseListener);
    this.touchSubscriptions.set(request, touchListener);
    this.subscriptionsActivity.set(request, listenerActivity);
  }

  // удаление функциональности драг-дропа для ленты
  public detach(request: DragDropBinding): void {
    if (!request) {
      return;
    }
    const activity = this.subscriptionsActivity.get(request);
    this.subscriptionsActivity.delete(request);
    if (activity) {
      activity.next(true);
    }
    const mouseSubscription = this.mouseSubscriptions.get(request);
    this.mouseSubscriptions.delete(request);
    if (mouseSubscription) {
      mouseSubscription.unsubscribe();
    }
    const touchSubscription = this.touchSubscriptions.get(request);
    this.touchSubscriptions.delete(request);
    if (touchSubscription) {
      touchSubscription.unsubscribe();
    }
  }

  private dragStart(request: DragDropBinding, mouseEvt: MouseEvent, touchEvt: TouchEvent) {
    const mouseInitiated = mouseEvt !== null;
    const state = new DragState();
    state.request = request;
    state.mouseInitiated = mouseInitiated;
    const feed = request.feedElement.nativeElement;
    feed.classList.add('dragging');
    const paddings = HelperService.getContainerIndent(feed.parentElement);
    if (request.direction === DragDropDirection.HORIZONTAL) {
      // определяем смещение по дельте координат вьюпорта и ленты (через getComputedStyle очень сложно найти действующий translateX)
      state.initialOffset = state.offset = request.offsetType === DragDropOffsetType.SCROLL ? feed.scrollLeft :
        feed.getBoundingClientRect().left - feed.parentElement.getBoundingClientRect().left - paddings.left;
      state.containerDimension = request.containerDimension || feed.parentElement.clientWidth;
      state.feedDimension = feed.scrollWidth;
    } else {
      state.initialOffset = state.offset = request.offsetType === DragDropOffsetType.SCROLL ? feed.scrollTop :
        feed.getBoundingClientRect().top - feed.parentElement.getBoundingClientRect().top - paddings.top;
      state.containerDimension = request.containerDimension || feed.parentElement.clientHeight;
      state.feedDimension = feed.scrollHeight;
    }
    state.itemDimension = request.itemDimension || state.containerDimension;
    state.frameDimension = (state.containerDimension - state.itemDimension) / 2;
    state.initiallySelected = this.getSelectedIndex(state.initialOffset, state);
    this.updateShift(mouseEvt, touchEvt, state, true);
    this.renderState(state);
    if (request.dragStart) {
      request.dragStart(state);
    }
    this.createTemporaryListeners(mouseInitiated, state);
    const evt = mouseEvt || touchEvt;
    evt.preventDefault();
    evt.stopPropagation();
  }

  private createTemporaryListeners(mouseInitiated: boolean, state: DragState) {
    const listenersActivity = new Subject<boolean>();
    const moveSubscription = fromEvent(document, mouseInitiated ? 'mousemove' : 'touchmove')
      .pipe(takeUntil(listenersActivity))
      .subscribe((evt: MouseEvent | TouchEvent) =>
        this.dragInProcess(mouseInitiated ? evt as MouseEvent : null, mouseInitiated ? null : evt as TouchEvent, state));
    const endSubscription = fromEvent(document, mouseInitiated ? 'mouseup' : 'touchend')
      .pipe(takeUntil(listenersActivity))
      .subscribe((evt: MouseEvent | TouchEvent) => {
        listenersActivity.next(true);
        moveSubscription.unsubscribe();
        endSubscription.unsubscribe();
        this.dragReleased(mouseInitiated ? evt as MouseEvent : null, mouseInitiated ? null : evt as TouchEvent, state);
    });
  }

  private dragInProcess(mouseEvt: MouseEvent, touchEvt: TouchEvent, state: DragState) {
    this.updateShift(mouseEvt, touchEvt, state);
    state.shifted = true;
    this.renderState(state);
    if (state.request.dragProgress) {
      state.request.dragProgress(state);
    }
  }

  private dragReleased(mouseEvt: MouseEvent, touchEvt: TouchEvent, state: DragState) {
    state.request.feedElement.nativeElement.classList.remove('dragging');
    state.released = true;
    if (state.request.dragRelease) {
      state.request.dragRelease(state);
    }
    if (state.shifted && state.request.centeringNeeded) {
      this.animateCentering(state);
    } else {
      this.finalizeDragging(state);
    }
  }

  private updateShift(mouseEvt: MouseEvent, touchEvt: TouchEvent, state: DragState, initial = false) {
    const mouseInitiated = mouseEvt !== null;
    let position = 0;
    if (state.request.direction === DragDropDirection.HORIZONTAL) {
      position = mouseInitiated ? mouseEvt.clientX : touchEvt.touches[0].clientX;
    } else {
      position = mouseInitiated ? mouseEvt.clientY : touchEvt.touches[0].clientY;
    }
    if (initial) {
      state.dragStartPosition = position;
      state.shift = state.relativeShift = 0;
    } else {
      if (state.request.limit) {
        const lowerBound = state.dragStartPosition - (state.feedDimension + state.initialOffset - state.containerDimension);
        const upperBound = state.dragStartPosition - state.initialOffset;
        position = Math.min(Math.max(position, lowerBound), upperBound);
      }
      state.shift = state.dragStartPosition - position;
      state.relativeShift = this.shiftToRelativeShift(state.shift, state);
      state.dragForward = state.shift > 0;
    }
    state.offset = state.initialOffset - state.shift;
  }

  private animateCentering(state: DragState) {
    const threshold = state.request.centeringThreshold || ConstantsService.DEFAULT_DRAGDROP_CENTERING_THRESHOLD;
    let animationTime = state.request.centeringDuration;
    animationTime = animationTime === undefined ? ConstantsService.DEFAULT_DRAGDROP_ANIMATION_DURATION : animationTime;
    state.animatedForward = (Math.abs(state.relativeShift) - Math.floor(Math.abs(state.relativeShift))) > threshold;
    const animationInitialOffset = state.offset;
    const rounding = state.dragForward ?
      (state.animatedForward ? Math.ceil : Math.floor) :
      (state.animatedForward ? Math.floor : Math.ceil);
    state.relativeShift = rounding(state.relativeShift);
    state.selected = state.initiallySelected + state.relativeShift;
    state.offset = this.getShiftForIndex(state.selected, state);
    state.shift = state.initialOffset - state.offset;
    const feed = state.request.feedElement.nativeElement;
    if (state.request.offsetType === DragDropOffsetType.SCROLL) {
      // для скролла анимация не работает через AnimationBuilder, довольствуемся цсс скролом (не на SF/IE)
      this.renderer.setStyle(feed, 'scroll-behavior', 'smooth');
      this.finalizeDragging(state);
    } else {
      if (animationTime > 0) {
        const initialAnimationStyle = this.createStyle(state, animationInitialOffset, 'px');
        const initialAnimationPosition = {[initialAnimationStyle.property]: initialAnimationStyle.value};
        const finalAnimationStyle = this.createStyle(state, state.offset, 'px');
        const finalAnimationPosition = {[finalAnimationStyle.property]: finalAnimationStyle.value};
        const animationPlayer = this.animationBuilder.build([
          style(initialAnimationPosition), animate(animationTime, style(finalAnimationPosition))
        ]).create(feed);
        animationPlayer.onDone(() => {
          animationPlayer.destroy();
          this.finalizeDragging(state);
        });
        animationPlayer.play();
      } else {
        this.finalizeDragging(state);
      }
    }
  }

  private shiftToRelativeShift(shift: number, state: DragState): number {
    const itemWithGap = state.itemDimension + (state.request.itemsDistance || 0);
    const shiftWithGap = shift + (state.request.itemsDistance || 0);
    return Math.abs(shift) <= state.itemDimension ? shift / state.itemDimension : shiftWithGap / itemWithGap;
  }

  private getSelectedIndex(offset: number, state: DragState): number {
    const feedToContainerCenter = state.containerDimension / 2 - offset;
    const itemWithGap = state.itemDimension + (state.request.itemsDistance || 0);
    return Math.max(0, Math.ceil(feedToContainerCenter / itemWithGap) - 1);
  }

  private getShiftForIndex(index: number, state: DragState): number {
    const itemWithGap = state.itemDimension + (state.request.itemsDistance || 0);
    return Math.min(-(itemWithGap * index) + state.frameDimension, 0);
  }

  private finalizeDragging(state: DragState) {
    this.renderState(state);
    this.updateVisibleAndActive(state);
    if (state.request.cleanUp) {
      this.renderState(state, null);
    }
    state.done = true;
    if (state.request.dragEnd) {
      state.request.dragEnd(state);
    }
  }

  private renderState(state: DragState, overrideValue?: any) {
    const feed = state.request.feedElement.nativeElement;
    const isScroll = state.request.offsetType === DragDropOffsetType.SCROLL;
    const value = overrideValue === undefined ? state.offset : overrideValue;
    const unit = isScroll ? null : 'px';
    const dragStyle = this.createStyle(state, value, unit);
    if (isScroll) {
      this.renderer.setProperty(feed, dragStyle.property, dragStyle.value);
    } else {
      if (dragStyle.value === null) {
        this.renderer.removeStyle(feed, dragStyle.property);
      } else {
        this.renderer.setStyle(feed, dragStyle.property, dragStyle.value);
      }
    }
    this.updateVisibleAndActive(state);
  }

  private updateVisibleAndActive(state: DragState) {
    const feed = state.request.feedElement.nativeElement;
    const feedElements = feed.childNodes;
    const visibility = [];
    feedElements.forEach((feedElement, index) => {
      if (feedElement.nodeType === Node.ELEMENT_NODE) {
        const visibilityExtent = HelperService.getVisibilityExtent(feedElement, feed.parentElement);
        visibility[index] = visibilityExtent;
        if (visibilityExtent > 0) {
          if (feedElement.classList.contains('out-of-area')) {
            this.renderer.removeClass(feedElement, 'out-of-area');
          }
        } else {
          if (!feedElement.classList.contains('out-of-area')) {
            this.renderer.addClass(feedElement, 'out-of-area');
          }
        }
      }
    });
    state.visible = [];
    state.active = [];
    visibility.forEach((visibilityExtent, index) => {
      if (visibilityExtent > 0) {
        state.visible.push(index);
        if (visibilityExtent > 0.9999) {
          state.active.push(index);
        }
      }
    });
    state.selected = this.getSelectedIndex(state.offset, state);
  }

  private createStyle(state: DragState, valueDimensionless: number, units: string) {
    const value = valueDimensionless !== null && units ? valueDimensionless + units : valueDimensionless;
    if (state.request.direction === DragDropDirection.HORIZONTAL) {
      switch (state.request.offsetType) {
        case DragDropOffsetType.POSITION:
          return {
            property: 'left',
            value
          };
        case DragDropOffsetType.TRANSFORM:
          return {
            property: 'transform',
            value: value === null ? value : 'translateX(' + value + ')'
          };
        case DragDropOffsetType.SCROLL:
          return {
            property: 'scrollLeft',
            value
          };
      }
    } else if (state.request.direction === DragDropDirection.VERTICAL) {
      switch (state.request.offsetType) {
        case DragDropOffsetType.POSITION:
          return {
            property: 'top',
            value
          };
        case DragDropOffsetType.TRANSFORM:
          return {
            property: 'transform',
            value: value === null ? value : 'translateY(' + value + ')'
          };
        case DragDropOffsetType.SCROLL:
          return {
            property: 'scrollTop',
            value
          };
      }
    }
    return {
      property: null,
      value
    };
  }
}

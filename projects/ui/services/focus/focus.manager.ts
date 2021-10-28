import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject, Subscription } from 'rxjs';

export class FocusState {

  constructor(current: any, prev: any, focusEvent?: FocusEvent) {
    this.current = current;
    this.prev = prev;
    this.focusEvent = focusEvent;
  }

  public prev: any;
  public current: any;
  public focusEvent?: FocusEvent;
}

export interface Focusable {
  handleFocus(): void;
  handleBlur(focusEvent?: FocusEvent): void;
}

// таймаут от срабатывания блюра до неприобретения его никаким элементом чтоб считаться утратой фокуса "в никуда"
// используется для того чтобы оповестить в этом случае покинутый элемент
export const BLUR_TO_FOCUS_COMMON_DELAY = 200;
// время памяти о последней фокусировке чтобы считать ее "только что сделанной"
// используется в процессе обработчиков, идущих позже (click) которые отстают от фокусных событий на время обработки, используется для
// кейсов когда focus и click на элементе срабатывают одновременно при клике и обработка (click) в этом случае избыточна
export const FOCUS_MEMORY_COMMON_DELAY = 500;

@Injectable({
  providedIn: 'root'
})
export class FocusManager {

  constructor() { }

  private lastKnownFocusedComponent: Element;
  private focusingTimestamp = new Date();
  private awaitingFocusReceiving = false;
  private documentSuspended = false;

  private focusedComponent = new BehaviorSubject<FocusState>(new FocusState(null, null));
  private focusedComponentNotifier: Observable<FocusState> = this.focusedComponent.asObservable();
  private subscriptions = new Map<Focusable, Subscription>();

  public notifyFocusMayChanged(targetedComponent: any, isFocusEvent: boolean, event?: FocusEvent) {
    if (isFocusEvent) {
      if (this.documentSuspended) {
        this.documentSuspended = false;
        setTimeout(() => {
          if (!this.lastKnownFocusedComponent && document.activeElement !== document.body) {
            this.publishFocusState(targetedComponent);
          }
        });
        return;
      }
      this.awaitingFocusReceiving = false;
      this.publishFocusState(targetedComponent);
    } else {
      this.awaitingFocusReceiving = true;
      setTimeout(() => {
        if (this.awaitingFocusReceiving) {
          this.publishFocusLost(event);
        }
      }, BLUR_TO_FOCUS_COMMON_DELAY);
    }
  }

  public publishFocusLost(event: FocusEvent) {
    this.awaitingFocusReceiving = false;
    if (this.lastKnownFocusedComponent !== null) {
      this.focusedComponent.next(new FocusState(null, this.lastKnownFocusedComponent, event));
      this.lastKnownFocusedComponent = null;
    }
    this.documentSuspended = !document.hasFocus();
  }

  public publishFocusState(targetedComponent: any) {
    if (this.lastKnownFocusedComponent !== targetedComponent) {
      const prevFocused = this.lastKnownFocusedComponent;
      this.lastKnownFocusedComponent = targetedComponent;
      this.focusingTimestamp = new Date();
      this.focusedComponent.next(new FocusState(targetedComponent, prevFocused));
    }
  }

  public subscribe(observer: Observer<FocusState>) {
    return this.focusedComponentNotifier.subscribe(observer);
  }

  public register(component: Focusable) {
    const subscription = this.subscribe({next: (state: FocusState) => {
      if (state.current === component) {
        component.handleFocus();
      } else if (state.prev === component) {
        component.handleBlur(state.focusEvent);
      }
    }} as Observer<any>);
    this.subscriptions.set(component, subscription);
  }

  public unregister(component: Focusable) {
    if (this.subscriptions.has(component)) {
      const subscription = this.subscriptions.get(component);
      subscription.unsubscribe();
      this.subscriptions.delete(component);
    }
  }

  public isJustFocused(components: any | Array<any>) {
    const check = (component) => {
      const timePassed = new Date().getTime() - this.focusingTimestamp.getTime();
      return component === this.lastKnownFocusedComponent && timePassed < FOCUS_MEMORY_COMMON_DELAY;
    };
    if (Array.isArray(components)) {
      return components.some(check);
    } else {
      return check(components);
    }
  }
}

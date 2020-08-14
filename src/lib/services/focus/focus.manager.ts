import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject, Subscription } from 'rxjs';

export class FocusState {

  constructor(current: any, prev: any) {
    this.current = current;
    this.prev = prev;
  }

  public prev: any;
  public current: any;
}

export interface Focusable {
  handleFocus(): void;
  handleBlur(): void;
}

export const BLUR_TO_FOCUS_COMMON_DELAY = 200;
export const FOCUS_TO_CLICK_COMMON_DELAY = 200;

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

  public notifyFocusMayChanged(targetedComponent: any, isFocusEvent: boolean) {
    if (isFocusEvent) {
      if (this.documentSuspended) {
        this.documentSuspended = false;
        return;
      }
      this.awaitingFocusReceiving = false;
      if (this.lastKnownFocusedComponent !== targetedComponent) {
        const prevFocused = this.lastKnownFocusedComponent;
        this.lastKnownFocusedComponent = targetedComponent;
        this.focusedComponent.next(new FocusState(targetedComponent, prevFocused));
        this.focusingTimestamp = new Date();
      }
    } else {
      this.awaitingFocusReceiving = true;
      setTimeout(() => {
        if (this.awaitingFocusReceiving) {
          this.publishFocusLost();
        }
      }, BLUR_TO_FOCUS_COMMON_DELAY);
    }
  }

  public notifyFocusMayLost(targetedComponent: any) {
    if (this.lastKnownFocusedComponent === targetedComponent) {
      this.publishFocusLost();
    }
  }

  public publishFocusLost() {
    this.awaitingFocusReceiving = false;
    this.focusedComponent.next(new FocusState(null, this.lastKnownFocusedComponent));
    this.lastKnownFocusedComponent = null;
    this.documentSuspended = !document.hasFocus();
  }

  public subscribe(observer: Observer<any>) {
    return this.focusedComponentNotifier.subscribe(observer);
  }

  public register(component: Focusable) {
    const subscription = this.subscribe({next: (state: FocusState) => {
      if (state.current === component) {
        component.handleFocus();
      } else if (state.prev === component) {
        component.handleBlur();
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
      return component === this.lastKnownFocusedComponent
        && (new Date().getTime() - this.focusingTimestamp.getTime() < FOCUS_TO_CLICK_COMMON_DELAY);
    };
    if (Array.isArray(components)) {
      return components.some(check);
    } else {
      return check(components);
    }
  }
}

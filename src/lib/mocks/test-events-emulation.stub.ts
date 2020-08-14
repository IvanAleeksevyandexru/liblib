import { BLUR_TO_FOCUS_COMMON_DELAY } from '../services/focus/focus.manager';
import { tick } from '@angular/core/testing';

export class TestEvents {

  public static STD_KEY_INFO = {bubbles: true, cancelable: true, location: 0, metaKey: false, repeat: false, shiftKey: false};

  public static change() {
    return new Event('change', {bubbles: true, cancelable: false});
  }

  public static input() {
    return new Event('input', {bubbles: true, cancelable: false});
  }

  public static mousedown() {
    return new MouseEvent('mousedown', {bubbles: true, cancelable: true});
  }

  public static mouseup() {
    return new MouseEvent('mouseup', {bubbles: true, cancelable: true});
  }

  public static mouseenter() {
    return new MouseEvent('mouseenter', {bubbles: true, cancelable: true});
  }

  public static mouseleave() {
    return new MouseEvent('mouseleave', {bubbles: true, cancelable: true});
  }

  public static mouseover() {
    return new MouseEvent('mouseover', {bubbles: true, cancelable: true});
  }

  public static mouseout() {
    return new MouseEvent('mouseout', {bubbles: true, cancelable: true});
  }

  public static mousemove() {
    return new MouseEvent('mousemove', {bubbles: true, cancelable: true});
  }

  public static keydown() {
    return new KeyboardEvent('keydown', {bubbles: true, cancelable: true});
  }

  public static keyup() {
    return new KeyboardEvent('keyup', {bubbles: true, cancelable: true});
  }

  public static keypress() {
    return new KeyboardEvent('keypress', {bubbles: true, cancelable: true});
  }

  public static touchstart(additionals?: any) {
    return new TouchEvent('touchstart', Object.assign({bubbles: true, cancelable: true}, additionals));
  }

  public static touchend(additionals?: any) {
    return new TouchEvent('touchend', Object.assign({bubbles: true, cancelable: true}, additionals));
  }

  public static touchmove(additionals?: any) {
    return new TouchEvent('touchmove', Object.assign({bubbles: true, cancelable: true}, additionals));
  }

  public static blur(el: HTMLInputElement) {
    el.blur();
    el.dispatchEvent(new Event('blur'));
  }

  public static focus(el: HTMLInputElement) {
    const activeElement = document.activeElement;
    if (activeElement) {
      TestEvents.blur(activeElement as HTMLInputElement);
    }
    el.focus();  // responsible for document.activeElement change, but doesn't trigger listeners
    el.dispatchEvent(new Event('focus'));  // triggers listeners, but doesn't change activeElement
  }

  public static makeTouched(el: HTMLInputElement) {
    TestEvents.focus(el);
    TestEvents.blur(el); // make input touched
    tick(BLUR_TO_FOCUS_COMMON_DELAY);
  }

  public static getCaretPosition(element: HTMLInputElement) {
    return element.selectionStart;
  }

  public static setCaretPosition(element: HTMLInputElement, caretPos: number) {
    if (document.activeElement !== element) {
      element.focus();
    }
    element.setSelectionRange(caretPos, caretPos);
  }

  public static pressSymbol(element: HTMLInputElement, code: string, symbol: string) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {code, key: symbol}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {code, key: symbol}));
    const keypress = new KeyboardEvent('keypress', Object.assign({}, TestEvents.STD_KEY_INFO, {code, key: symbol}));
    const input = new Event('input', {bubbles: true, cancelable: false});
    element.dispatchEvent(keydown);
    element.dispatchEvent(keypress);
    const caretPos = TestEvents.getCaretPosition(element);
    element.value = element.value.substring(0, caretPos) + symbol + element.value.substring(caretPos);
    TestEvents.setCaretPosition(element, caretPos + 1);
    element.dispatchEvent(input);
    element.dispatchEvent(keyup);
  }

  public static pressBackspace(element: HTMLInputElement) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'Backspace', key: 'Backspace'}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'Backspace', key: 'Backspace'}));
    const input = new Event('input', {bubbles: true, cancelable: false});
    element.dispatchEvent(keydown);
    const caretPos = TestEvents.getCaretPosition(element);
    element.value = element.value.substring(0, caretPos - 1 ) + element.value.substring(caretPos);
    TestEvents.setCaretPosition(element, caretPos - 1);
    element.dispatchEvent(input);
    element.dispatchEvent(keyup);
  }

  public static arrowDown(element: HTMLInputElement) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'ArrowDown', key: 'ArrowDown'}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'ArrowDown', key: 'ArrowDown'}));
    element.dispatchEvent(keydown);
    element.dispatchEvent(keyup);
  }

  public static arrowUp(element: HTMLInputElement) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'ArrowUp', key: 'ArrowUp'}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'ArrowUp', key: 'ArrowUp'}));
    element.dispatchEvent(keydown);
    element.dispatchEvent(keyup);
  }

  public static enter(element: HTMLInputElement) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {ode: 'Enter', key: 'Enter'}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {ode: 'Enter', key: 'Enter'}));
    const keypress = new KeyboardEvent('keypress', Object.assign({}, TestEvents.STD_KEY_INFO, {ode: 'Enter', key: 'Enter'}));
    element.dispatchEvent(keydown);
    element.dispatchEvent(keypress);
    element.dispatchEvent(keyup);
  }

  public static escape(element: HTMLInputElement) {
    const keydown = new KeyboardEvent('keydown', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'Escape', key: 'Escape'}));
    const keyup = new KeyboardEvent('keyup', Object.assign({}, TestEvents.STD_KEY_INFO, {code: 'Escape', key: 'Escape'}));
    element.dispatchEvent(keydown);
    element.dispatchEvent(keyup);
  }

  public static sendSwipeEvent(element: HTMLElement, type: string, x: number, y: number) {
    const clientRect = element.getBoundingClientRect();
    const inside = x >= clientRect.left && x <= clientRect.right && y >= clientRect.top && y <= clientRect.bottom;
    const touches = new Touch({identifier: Date.now(), target: inside ? element : document.body, clientX: x, clientY: y});
    const evt = TestEvents[type]({touches: [touches]});
    inside ? element.dispatchEvent(evt) : document.body.dispatchEvent(evt);
  }

  public static swipeLeft(element: HTMLElement, distance: number, middleCheck: () => void = null) {
    const clientRect = element.getBoundingClientRect();
    const centerWidth = clientRect.left + clientRect.width / 2;
    const centerHeight = clientRect.top + clientRect.height / 2;
    TestEvents.sendSwipeEvent(element, 'touchstart', centerWidth, centerHeight);
    for (let i = 0; i < distance; i++) {
      TestEvents.sendSwipeEvent(element, 'touchmove', centerWidth - i, centerHeight);
      if (i === Math.round(distance / 2) && middleCheck) {
        middleCheck();
      }
    }
    TestEvents.sendSwipeEvent(element, 'touchend', centerWidth - distance, centerHeight);
  }

  public static swipeRight(element: HTMLElement, distance: number, middleCheck: () => void = null) {
    const clientRect = element.getBoundingClientRect();
    const centerWidth = clientRect.left + clientRect.width / 2;
    const centerHeight = clientRect.top + clientRect.height / 2;
    TestEvents.sendSwipeEvent(element, 'touchstart', centerWidth, centerHeight);
    for (let i = 0; i < distance; i++) {
      TestEvents.sendSwipeEvent(element, 'touchmove', centerWidth + i, centerHeight);
      if (i === Math.round(distance / 2) && middleCheck) {
        middleCheck();
      }
    }
    TestEvents.sendSwipeEvent(element, 'touchend', centerWidth + distance, centerHeight);
  }

  public static swipeUp(element: HTMLElement, distance: number, middleCheck: () => void = null) {
    const clientRect = element.getBoundingClientRect();
    const centerWidth = clientRect.left + clientRect.width / 2;
    const centerHeight = clientRect.top + clientRect.height / 2;
    TestEvents.sendSwipeEvent(element, 'touchstart', centerWidth, centerHeight);
    for (let i = 0; i < distance; i++) {
      TestEvents.sendSwipeEvent(element, 'touchmove', centerWidth, centerHeight - i);
      if (i === Math.round(distance / 2) && middleCheck) {
        middleCheck();
      }
    }
    TestEvents.sendSwipeEvent(element, 'touchend', centerWidth, centerHeight - distance);
  }

  public static swipeDown(element: HTMLElement, distance: number, middleCheck: () => void = null) {
    const clientRect = element.getBoundingClientRect();
    const centerWidth = clientRect.left + clientRect.width / 2;
    const centerHeight = clientRect.top + clientRect.height / 2;
    TestEvents.sendSwipeEvent(element, 'touchstart', centerWidth, centerHeight);
    for (let i = 0; i < distance; i++) {
      TestEvents.sendSwipeEvent(element, 'touchmove', centerWidth, centerHeight + i);
      if (i === Math.round(distance / 2) && middleCheck) {
        middleCheck();
      }
    }
    TestEvents.sendSwipeEvent(element, 'touchend', centerWidth, centerHeight + distance);
  }

}

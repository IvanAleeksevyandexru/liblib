export class TestHelper {

  public static isVisibleInsideScrollViewport(el: HTMLElement, scrollArea: HTMLElement) {
    if (scrollArea.contains(el)) {
      return el.offsetLeft >= scrollArea.scrollLeft && el.offsetLeft + el.clientWidth <= scrollArea.scrollLeft + scrollArea.clientWidth
          && el.offsetTop >= scrollArea.scrollTop && el.offsetTop + el.clientHeight <= scrollArea.scrollTop + scrollArea.clientHeight;
    } else {
      return false;
    }
  }

  public static isIntersecting(a: ClientRect, b: ClientRect) {
    const pointBetween = (dimA: number, dimB: number, sizeB: number) => dimA >= dimB && dimA <= dimB + sizeB;
    if (pointBetween(a.left, b.left, b.width)) {
      return pointBetween(a.top, b.top, b.height) || pointBetween(a.top + a.height, b.top, b.height);
    } else if (pointBetween(b.left, a.left, a.width)) {
      return pointBetween(b.top, a.top, a.height) || pointBetween(b.top + b.height, a.top, a.height);
    } else {
      return false;
    }
  }

  public static isIterable(x: any) {
    return x && typeof x[Symbol.iterator] === 'function' || typeof x === 'function' || typeof x === 'object';
  }

  public static isString(x: any) {
    return typeof x === 'string' || x instanceof String;
  }

  public static deepCompare(x: any, y: any) {
    if (!x || !y) {
      return x === y;
    } else if (x && y) {
      if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length === y.length) {
          for (let i = 0; i < x.length; i++) {
            if (!TestHelper.deepCompare(x[i], y[i])) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      }
      if (Array.isArray(x) || Array.isArray(y)) {
        return false;
      }
      if (TestHelper.isString(x) && TestHelper.isString(y)) {
        return x === y;
      }
      if (TestHelper.isString(x) || TestHelper.isString(y)) {
        return false;
      }
      if (x instanceof Date && y instanceof Date) {
        return x.getTime() === y.getTime();
      }
      if (x instanceof Date || y instanceof Date) {
        return false;
      }
      if (TestHelper.isIterable(x) && TestHelper.isIterable(y)) {
        for (const i in x) {
          if (!TestHelper.deepCompare(x[i], y[i])) {
            return false;
          }
        }
        for (const i in y) {
          if (!TestHelper.deepCompare(x[i], y[i])) {
            return false;
          }
        }
        return true;
      }
      if (TestHelper.isIterable(x) || TestHelper.isIterable(y)) {
        return false;
      }
      return x === y;
    } else {
      return false;
    }
  }

}

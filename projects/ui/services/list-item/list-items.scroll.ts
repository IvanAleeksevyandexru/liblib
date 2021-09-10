import { ElementRef, NgZone } from '@angular/core';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { VirtualScrollComponent } from '@epgu/ui/components/virtual-scroll';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { ListItem, AutocompleteSuggestion } from '@epgu/ui/models/dropdown';
import { Subject, Observable, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { LineBreak } from '@epgu/ui/models/common-enums';

const EVAL_HEIGHT_INDEX_INCREMENT = 100;
const EVAL_HEIGHT_MEASURE_STYLES = {
  display: 'block',
  visibility: 'hidden',
  position: 'absolute',
  lineHeight: '24px',
  fontSize: '16px',
  fontFamily: 'Helvetica',
  whiteSpace: 'wrap'
};

// статика для обработки скролла и клавиатурной навигации
export class ListItemsAccessoryService {

  public static handleKeyboardNavigation(e: KeyboardEvent, items: Array<ListItem | AutocompleteSuggestion>,
                                         highlightedElement: ListItem | AutocompleteSuggestion,
                                         highlightableCheck: (ListItem) => boolean,
                                         scrollArea: ElementRef | PerfectScrollbarComponent | VirtualScrollComponent)
    : ListItem | AutocompleteSuggestion | boolean {
    if (e.key === 'ArrowUp') {  // вверх
      e.preventDefault();
      e.stopPropagation();
      const prevVisible = ListItemsAccessoryService.findNextItem(items, highlightedElement, false, highlightableCheck);
      if (prevVisible !== null) {
        ListItemsAccessoryService.scrollTo(scrollArea, prevVisible);
        return items[prevVisible];
      }
    } else if (e.key === 'ArrowDown') {  // вниз
      e.preventDefault();
      e.stopPropagation();
      const nextVisible = ListItemsAccessoryService.findNextItem(items, highlightedElement, true, highlightableCheck);
      if (nextVisible !== null) {
        ListItemsAccessoryService.scrollTo(scrollArea, nextVisible);
        return items[nextVisible];
      }
    } else if (e.key === 'ArrowLeft') {
      if (highlightedElement instanceof ListItem) {
        (highlightedElement as ListItem).collapse();
        return true;
      }
    } else if (e.key === 'ArrowRight') {
      if (highlightedElement instanceof ListItem) {
        (highlightedElement as ListItem).expand();
        return true;
      }
    }
    return false;
  }

  public static findNextItem(source: Array<ListItem | AutocompleteSuggestion>, highlightedElement: ListItem | AutocompleteSuggestion,
                             directionForward: boolean, highlightableCheck: (ListItem) => boolean) {
    if (!source || !source.length) {
      return null;
    }
    const fromIndex = source.findIndex((item: ListItem | AutocompleteSuggestion) => item === highlightedElement);
    const initialIndex = fromIndex === -1 && !directionForward ? 0 : fromIndex;
    let index = initialIndex;
    do {
      index = directionForward ? ++index : --index;
      if (index < 0) {
        index = source.length - 1;
      } else if (index >= source.length) {
        index = 0;
      }
      if (highlightableCheck(source[index])) {
        return index;
      }
    } while (index !== initialIndex);
    return null;
  }

  public static scrollTo(scrollElement: ElementRef | PerfectScrollbarComponent | VirtualScrollComponent, elementIndex: number) {
    if (scrollElement instanceof VirtualScrollComponent) {
      (scrollElement as VirtualScrollComponent).scrollToIndex(elementIndex);
    } else {
      let scrollContainer;
      let scrollArea;
      if (scrollElement instanceof PerfectScrollbarComponent) {
        scrollContainer = (scrollElement as PerfectScrollbarComponent).directiveRef.elementRef.nativeElement;
        scrollArea = scrollContainer.children[0];
      } else if(scrollArea) {
        scrollArea = (scrollArea as ElementRef).nativeElement;
        scrollContainer = this.findScrollContainer(scrollArea);
      }
      if (scrollArea && scrollContainer && elementIndex >= 0
        && elementIndex < scrollArea.childElementCount) {
        let itemElement = scrollArea.children[elementIndex];
        if (itemElement) {
          let height = 0;
          while (itemElement !== null) {
            height += itemElement.offsetHeight || 0;
            itemElement = itemElement.previousSibling;
          }
          scrollContainer.scrollTop = height - 100;
        }
      }
    }
  }

  public static runBackgroundSizeEstimating(items: Array<ListItem | AutocompleteSuggestion>, containerWidth: number, ngZone: NgZone,
                                            params: { [key: string]: any }, startIndex?: number, measureElement?: HTMLElement)
    : Observable<number> {
    const result = new Subject<number>();
    const index = startIndex || 0;
    const nextIndexStop = Math.min(index + EVAL_HEIGHT_INDEX_INCREMENT, items.length);
    let measureContainer = measureElement;
    if (!measureContainer) {
      measureContainer = document.createElement('div');
      Object.assign(measureContainer.style, EVAL_HEIGHT_MEASURE_STYLES,
        {width: (containerWidth - 22 - (params.multi ? 34 : 0)) + 'px'}); // r+l padding
      document.body.appendChild(measureContainer);
    }
    let totalHeight = 0;
    for (let i = index; i < nextIndexStop; i++) {
      measureContainer.innerHTML = items[i] instanceof ListItem ? (items[i] as ListItem).listFormatted : items[i].text;
      const itemEmpty = (items[i] as any).hidden || items[i].lineBreak === LineBreak.SELF;
      const height = itemEmpty ? 0 : measureContainer.clientHeight + 12; // t+b padding
      items[i].dimensions = {width: containerWidth, height};
      totalHeight += height;
    }
    if (items.length > nextIndexStop) {
      ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const subResult = this.runBackgroundSizeEstimating(items, containerWidth, ngZone, params, nextIndexStop, measureContainer);
          subResult.subscribe((furtherHeight) => result.next(totalHeight + furtherHeight));
        });
      });
      return result.asObservable();
    } else {
      if (measureContainer) {
        measureContainer.parentNode.removeChild(measureContainer);
      }
      return of(totalHeight);
    }
  }

  private static findScrollContainer(baseElement: HTMLElement) {
    let base = baseElement;
    let level = 0;
    while (level < 3 && !base.classList.contains('ps')) {
      base = base.parentElement;
      level ++;
    }
    return base.classList.contains('ps') ? base : null;
  }
}

// контроллер виртуального скролла для списочных элементов
export class ListItemsVirtualScrollController implements VirtualScrollStrategy {

  constructor(acquireRenderedData: () => Array<ListItem | AutocompleteSuggestion>, autoDetectViewHeight?: boolean) {
    this.acquireRenderedData = acquireRenderedData;
    this.autoDetectViewHeight = autoDetectViewHeight;
  }

  private index$ = new Subject<number>();
  private viewport: CdkVirtualScrollViewport | null = null;
  private acquireRenderedData: () => Array<ListItem | AutocompleteSuggestion> = null;
  private autoDetectViewHeight = false; // ок для статичных вью

  public scrolledIndexChange = this.index$.pipe(distinctUntilChanged());

  public attach(viewport: CdkVirtualScrollViewport) {
    this.viewport = viewport;
    const data = this.acquireRenderedData();
    this.viewport.setTotalContentSize(data.reduce((acc, item) => acc + item.getItemHeight(), 0));
    this.updateRenderedRange();
  }

  public detach() {
    this.index$.complete();
    this.viewport = null;
  }

  public onContentScrolled() {
    this.updateRenderedRange();
  }

  public scrollToIndex(index: number, behavior: ScrollBehavior) {
    if (this.viewport) {
      this.viewport.scrollToOffset(this.getOffsetForIndex(index), behavior);
    }
  }

  public onDataLengthChanged() {
    if (this.viewport) {
      this.viewport.setRenderedRange({start: 0, end: 0});
      this.viewport.setRenderedContentOffset(0);
      this.updateRenderedRange();
    }
  }

  public onContentRendered() {}
  public onRenderedOffsetChanged() {}

  private getOffsetForIndex(index: number): number {
    const data = this.acquireRenderedData();
    return index === 0 ? 0 : data.slice(0, index).reduce((acc, item) => acc + item.getItemHeight(), 0);
  }

  private getIndexForOffset(offset: number): number {
    const data = this.acquireRenderedData();
    let i = 0;
    let left = offset;
    while (left > 0 && i < data.length) {
      left -= data[i].getItemHeight();
      i++;
    }
    return i;
  }

  private updateRenderedRange() {
    const viewport = this.viewport;
    const offset = viewport.measureScrollOffset();
    const viewportSize = this.autoDetectViewHeight ? this.viewport.getViewportSize() : 250;
    const {start, end} = viewport.getRenderedRange();
    const dataLength = viewport.getDataLength();
    const newRange = {start, end};
    const firstVisibleIndex = this.getIndexForOffset(offset);
    newRange.start = Math.max(0, this.getIndexForOffset(offset - 266)); // 200 - буффер ленты в px вверх и вниз
    newRange.end = Math.min(dataLength, this.getIndexForOffset(offset + viewportSize + 266));
    viewport.setRenderedRange(newRange);
    viewport.setRenderedContentOffset(this.getOffsetForIndex(newRange.start));
    this.index$.next(firstVisibleIndex);
  }
}

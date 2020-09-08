import { ElementRef, NgZone } from '@angular/core';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { VirtualScrollComponent } from '../../components/virtual-scroll/virtual-scroll.component';
import { ListItem, AutocompleteSuggestion } from '../../models/dropdown.model';
import { Subject, Observable, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { LineBreak } from '../../models/common-enums';

// статика для обработки скролла и клавиатурной навигации
export class ListItemsAccessoryService {

  public static handleKeyboardNavigation(e: KeyboardEvent, items: Array<ListItem | AutocompleteSuggestion>,
                                         highlightedElement: ListItem | AutocompleteSuggestion,
                                         highlightableCheck: (ListItem) => boolean,
                                         scrollArea: ElementRef | VirtualScrollComponent): ListItem | AutocompleteSuggestion | boolean {
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
      e.preventDefault();
      e.stopPropagation();
      if (highlightedElement instanceof ListItem) {
        (highlightedElement as ListItem).collapse();
        return true;
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
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

  public static scrollTo(scrollArea: ElementRef | VirtualScrollComponent, elementIndex: number) {
    if (scrollArea instanceof VirtualScrollComponent) {
      (scrollArea as VirtualScrollComponent).scrollToIndex(elementIndex);
    } else {
      const scrollContainerBaseRef = scrollArea as ElementRef;
      const scrollContainer = this.findScrollContainer(scrollContainerBaseRef);
      if (scrollContainerBaseRef && scrollContainer && elementIndex >= 0
          && elementIndex < scrollContainerBaseRef.nativeElement.childElementCount) {
        let itemElement = scrollContainerBaseRef.nativeElement.children[elementIndex];
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

  public static runBackgroundSizeEstimating(items: Array<ListItem>, containerWidth: number, ngZone: NgZone,
                                            startIndex?: number, measureElement?: HTMLElement): Observable<number> {
    const result = new Subject<number>();
    const index = startIndex || 0;
    const nextIndexStop = Math.min(index + 100, items.length);
    let measureContainer = measureElement;
    if (!measureContainer) {
      measureContainer = document.createElement('div');
      Object.assign(measureContainer.style, {
        display: 'block',
        visibility: 'hidden',
        position: 'absolute',
        width: (containerWidth - 22) + 'px', // r+l padding
        lineHeight: '24px',
        fontSize: '16px',
        fontFamily: 'Helvetica',
        whiteSpace: 'wrap'
      });
      document.body.appendChild(measureContainer);
    }
    let totalHeight = 0;
    for (let i = index; i < nextIndexStop; i++) {
      const itemEmpty = items[i].hidden || items[i].lineBreak === LineBreak.SELF;
      measureContainer.innerHTML = items[i].listFormatted;
      items[i].dimensions = {width: containerWidth, height: itemEmpty ? 0 : measureContainer.clientHeight + 12}; // t+b padding
      totalHeight += items[i].dimensions.height;
    }
    if (items.length > nextIndexStop) {
      ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const subResult = this.runBackgroundSizeEstimating(items, containerWidth, ngZone, nextIndexStop, measureContainer);
          subResult.subscribe((furtherHeight) => result.next(totalHeight + furtherHeight));
        });
      });
      return result.asObservable();
    } else {
      measureContainer.remove();
      return of(totalHeight);
    }
  }

  private static findScrollContainer(baseElement: ElementRef) {
    let base = baseElement && baseElement.nativeElement;
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

  constructor(acquireRenderedData: () => Array<ListItem>) {
    this.acquireRenderedData = acquireRenderedData;
  }

  private index$ = new Subject<number>();
  private viewport: CdkVirtualScrollViewport | null = null;
  private acquireRenderedData: () => Array<ListItem> = null;

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
    const viewportSize = 250; // высота фиксирована для выпадающих списков
    const {start, end} = viewport.getRenderedRange();
    const dataLength = viewport.getDataLength();
    const newRange = {start, end};
    const firstVisibleIndex = this.getIndexForOffset(offset);
    newRange.start = Math.max(0, this.getIndexForOffset(offset - 200)); // 200 - буффер ленты в px вверх и вниз
    newRange.end = Math.min(dataLength, this.getIndexForOffset(offset + viewportSize + 200));
    viewport.setRenderedRange(newRange);
    viewport.setRenderedContentOffset(this.getOffsetForIndex(newRange.start));
    this.index$.next(firstVisibleIndex);
  }
}

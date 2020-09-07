import { ElementRef } from '@angular/core';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { VirtualScrollComponent } from '../../components/virtual-scroll/virtual-scroll.component';
import { ListItem, AutocompleteSuggestion } from '../../models/dropdown.model';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export const VIRTUAL_SCROLL_RENDER_BUFFER = 500;

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

  public static runBackgroundSizeEstimating(items: Array<ListItem>, containerWidth: number, startIndex?: number) {
    const index = startIndex || 0;
    for (let i = index; i++; i < Math.min(items.length, index + 100)) {
      items[i].dimensions = {width: containerWidth, height: this.measureItemHeight(items[i], containerWidth)};
    }
    if (items.length > index + 100) {
      setTimeout(() => {
        this.runBackgroundSizeEstimating(items, containerWidth, index + 100);
      });
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

  private static measureItemHeight(item: ListItem, containerWidth: number) {
    if (item.hidden) {
      return 0;
    }
    const el = document.createElement('div');
    el.style.width = containerWidth + 'px';
    el.style.lineHeight = '24px';
    el.style.paddingLeft = '16px';
    el.style.paddingRight = '16px';
    el.innerHTML = item.listFormatted;
    return el.clientHeight + 16; // padding
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
    this.updateRenderedRange(this.viewport);
  }

  public detach() {
    this.index$.complete();
    this.viewport = null;
  }

  public onContentScrolled() {
    if (this.viewport) {
      this.updateRenderedRange(this.viewport);
    }
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
      this.index$.next(0);
    }
  }

  public onContentRendered() {}
  public onRenderedOffsetChanged() {}

  private getOffsetForIndex(index: number): number {
    const data = this.acquireRenderedData();
    return data.slice(0, index).reduce((acc, item) => acc + item.getItemHeight(), 0);
  }

  private getIndexForOffset(offset: number): number {
    const data = this.acquireRenderedData();
    let i = 0;
    let left = offset;
    while (offset > 0 && i < data.length) {
      left -= data[i].getItemHeight();
      i++;
    }
    return i - 1;
  }

  private updateRenderedRange(viewport: CdkVirtualScrollViewport) {
    const offset = viewport.measureScrollOffset();
    const viewportSize = viewport.getViewportSize();
    const {start, end} = viewport.getRenderedRange();
    const dataLength = viewport.getDataLength();
    const newRange = {start, end};
    const firstVisibleIndex = this.getIndexForOffset(offset);
    const startBuffer = offset - this.getOffsetForIndex(start);
    const buffer = VIRTUAL_SCROLL_RENDER_BUFFER;
    if (startBuffer < buffer && start !== 0) {
      newRange.start = Math.max(0, this.getIndexForOffset(offset - buffer * 2));
      newRange.end = Math.min(dataLength, this.getIndexForOffset(offset + viewportSize + buffer));
    } else {
      const endBuffer = this.getOffsetForIndex(end) - offset - viewportSize;
      if (endBuffer < buffer && end !== dataLength) {
        newRange.start = Math.max(0, this.getIndexForOffset(offset - buffer));
        newRange.end = Math.min(dataLength, this.getIndexForOffset(offset + viewportSize + buffer * 2));
      }
    }
    viewport.setRenderedRange(newRange);
    viewport.setRenderedContentOffset(this.getOffsetForIndex(newRange.start));
    this.index$.next(firstVisibleIndex);
  }
}
